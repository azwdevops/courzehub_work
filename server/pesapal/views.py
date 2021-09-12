# -*- coding: utf-8 -*-

from __future__ import absolute_import

import os
import logging
import oauth2 as oauth
import requests
import math

from django.apps import apps
from django.urls import reverse

from django.http import HttpResponse, QueryDict
from django.shortcuts import get_object_or_404
from django.utils.safestring import mark_safe
from django.utils.translation import ugettext_lazy as _
from django.views.generic.base import View, RedirectView, TemplateView

from xml.etree import cElementTree as ET

from . import conf as settings

from work.models import Task
from core.views import get_object_or_none
from accounting.api.views import TaskCreationTransaction


DEFAULT_TYPE = "MERCHANT"
app_name, model_name = settings.PESAPAL_TRANSACTION_MODEL.split(".")
PesapalTransaction = apps.get_model(app_label=app_name, model_name=model_name)

logger = logging.getLogger(__name__)


class PaymentRequestMixin(object):
    def sign_request(self, params, url_to_sign):
        token = None

        # Default signature method is SignatureMethod_HMAC_SHA1
        signature_method = getattr(
            oauth, settings.PESAPAL_OAUTH_SIGNATURE_METHOD)()

        consumer = oauth.Consumer(
            settings.PESAPAL_CONSUMER_KEY, settings.PESAPAL_CONSUMER_SECRET
        )
        signed_request = oauth.Request.from_consumer_and_token(
            consumer, http_url=url_to_sign, parameters=params, is_form_encoded=True
        )
        signed_request.sign_request(signature_method, consumer, token)
        return signed_request

    def build_signed_request(self, payload, **kwargs):
        """
        Returns a signed OAuth request. Assumes http protocol if request
        parameter is not provided.
        Otherwise it tries to figure out the url using the request object.
        """

        # we get the student course id and amount
        taskId = kwargs['taskId']
        amount = kwargs['amount']

        if self.request:
            callback_url = self.request.build_absolute_uri(
                reverse(settings.PESAPAL_OAUTH_CALLBACK_URL) +
                f'?taskId={taskId}&amount={amount}'
            )
        else:
            if settings.PRODUCTION:
                site_domain = os.environ['SITE_DOMAIN_PRODUCTION']
            else:
                site_domain = os.environ['SITE_DOMAIN_DEV']
            site_domain = os.environ['SITE_DOMAIN']
            protocol = "http" if settings.PESAPAL_DEMO else "https"
            callback_url = "{0}://{1}{2}?taskId={3}&amount={4}".format(
                protocol,
                site_domain,
                reverse(settings.PESAPAL_OAUTH_CALLBACK_URL),
                taskId,
                amount
            )

        params = {"oauth_callback": callback_url,
                  "pesapal_request_data": payload}

        signed_request = self.sign_request(
            params, settings.PESAPAL_IFRAME_LINK)

        return signed_request

    def generate_payload(self, **kwargs):
        """
        Generates the XML payload required by Pesapal
        """
        defaults = {
            "amount": 0,
            "description": "",
            "reference": "",
            "first_name": "",
            "last_name": "",
            "email": "",
            "type": DEFAULT_TYPE,
        }

        defaults.update(kwargs)

        xml_doc = ET.Element("PesapalDirectOrderInfo")
        xml_doc.set("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
        xml_doc.set("xmlns:xsd", "http://www.w3.org/2001/XMLSchema")
        xml_doc.set("xmlns", "http://www.pesapal.com")

        for k, v in defaults.items():
            # convert keys into pesapal properties format e.g. first_name --> FirstName
            key_items = [str(x).title() for x in k.split("_")]
            k = "".join(key_items)
            xml_doc.set(k, str(v))

        pesapal_request_data = ET.tostring(xml_doc)
        return pesapal_request_data

    def get_payment_url(self, **kwargs):
        """
        Use the computed order information to generate a url for the
        Pesapal iframe.

        Params should include the following keys:
            Required params: `amount`, `description`, `reference`, `email`
            Optional params: `first_name`, `last_name`, `type`
        """
        # assert type(params) == type({}), "Params must be of type 'dict'"

        # generate xml order
        payload = self.generate_payload(**kwargs)

        # generate iframe url, we send the payload to enable generation of signed request
        # we pass the **kwargs to allow adding of amount and student course id to callback url which will allow
        # us to add these items to the database alongside transaction id and merchant reference
        signed_request = self.build_signed_request(payload, **kwargs)
        return signed_request.to_url()

    def get_payment_status(self, **kwargs):
        """
        Query the payment status from pesapal using the `transaction_id`
        and the `merchant_reference_id`

        Params should include the following keys:
            Required params: `pesapal_merchant_reference`,
            `pesapal_transaction_tracking_id`
        """

        params = {
            "pesapal_merchant_reference": "",
            "pesapal_transaction_tracking_id": "",
        }

        params.update(**kwargs)

        signed_request = self.sign_request(
            params, settings.PESAPAL_QUERY_STATUS_LINK)

        url = signed_request.to_url()

        response = requests.get(
            url, headers={"content-type": "text/namevalue; charset=utf-8"}
        )
        if response.status_code != requests.codes.ok:
            logger.error(
                "Unable to complete payment status request with"
                "error response code {0}".format(response.status_code)
            )
            comm_status = False
        else:
            comm_status = True

        response_data = {}
        response_data["raw_request"] = url
        response_data["raw_response"] = response.text
        response_data["comm_success"] = comm_status

        _, values = response.text.split("=")
        _, payment_method, status, _ = values.split(",")
        response_data["payment_status"] = status
        response_data["payment_method"] = payment_method

        return response_data


class PaymentResponseMixin(object):
    def build_url_params(self):
        url_params = QueryDict("", mutable=True)
        url_params.update(
            {
                "pesapal_merchant_reference": self.transaction.merchant_reference,
                "pesapal_transaction_tracking_id": self.transaction.pesapal_transaction,
            }
        )
        url_params = "?" + url_params.urlencode()
        return url_params

    def get_payment_status_url(self):
        status_url = reverse("transaction_status")
        status_url += self.build_url_params()
        return status_url

    def get_order_completion_url(self):
        completed_url = reverse(
            settings.PESAPAL_TRANSACTION_DEFAULT_REDIRECT_URL)
        completed_url += self.build_url_params()
        return completed_url


class TransactionCompletedView(PaymentResponseMixin, TemplateView):

    """
    After Pesapal processes the transaction this will save the transaction and
    then redirect to whatever redirect URL in your settings as
    `PESAPAL_TRANSACTION_DEFAULT_REDIRECT_URL`.

    For further processing just create a `post_save` signal on the
    `PesapalTransaction` model.
    """

    template_name = "pesapal/post_payment.html"

    def get(self, request, *args, **kwargs):
        # now that we attached the task_id and amount to the callback url, we can get these items
        taskId = request.GET.get('taskId', 0)
        amount = request.GET.get('amount', 0)

        transaction_id = request.GET.get("pesapal_transaction_tracking_id", 0)
        merchant_reference = request.GET.get("pesapal_merchant_reference", 0)

        if transaction_id and merchant_reference:
            # try getting this transaction, if it does not exist create it
            try:
                self.transaction = PesapalTransaction.objects.get(merchant_reference=merchant_reference,
                                                                  pesapal_transaction=transaction_id)
            except PesapalTransaction.DoesNotExist:
                # get the task instance first to add this to transaction when entering transaction data to db
                task = get_object_or_none(Task, id=taskId)

                # if transaction does not exist, we create it adding the task_id and amount
                self.transaction = PesapalTransaction.objects.create(merchant_reference=merchant_reference,
                                                                     pesapal_transaction=transaction_id,
                                                                     amount=amount, task=task)

                # post this transaction to transactions for accounting purposes
                # instantiate a TaskCreationTransaction class
                task_creation_transaction = TaskCreationTransaction()
                instance_items = {
                    'pesapal_transaction_id': transaction_id,
                    'task': task,
                    'amount': amount
                }
                # call method to post transaction to database
                task_creation_transaction.post_task_creation_payment_base_transaction(
                    **instance_items)

        return super(TransactionCompletedView, self).get(request, *args, **kwargs)

    def get_context_data(self, **kwargs):

        ctx = super(TransactionCompletedView, self).get_context_data(**kwargs)

        # since we just want the user to confirm status and redirect to ongoing courses, we remove order completion
        # since it serves no purposes here, instead we have a button to go back to courses
        # ctx["transaction_completed_url"] = self.get_order_completion_url()
        ctx["transaction_status_url"] = self.get_payment_status_url()
        ctx["payment_status"] = self.transaction.payment_status

        if self.transaction.payment_status == PesapalTransaction.PENDING:
            message = mark_safe(
                _(
                    "Your payment is being processed."
                    '<br/><br/>'
                    "<h6>Please ensure you check status till it's completed before leaving this page.</h6>"
                )
            )
            ctx["payment_pending"] = True
        else:
            if self.transaction.payment_status == PesapalTransaction.COMPLETED:
                message = mark_safe(
                    _(
                        "Your payment has been successfully processed. "
                        "The page should automatically redirect in "
                        '<span class="countdown">3</span> seconds.'
                    )
                )
            elif self.transaction.payment_status == PesapalTransaction.FAILED:
                message = _(
                    "The processing of your payment failed. "
                    "Please contact the system administrator."
                )
            else:
                # INVALID
                message = _("The transaction details provided were invalid.")

        ctx["message"] = message
        return ctx


class UpdatePaymentStatusMixin(PaymentRequestMixin):
    def get_params(self):
        self.merchant_reference = self.request.GET.get(
            "pesapal_merchant_reference", 0)
        self.transaction_id = self.request.GET.get(
            "pesapal_transaction_tracking_id", None
        )

        params = {
            "pesapal_merchant_reference": self.merchant_reference,
            "pesapal_transaction_tracking_id": self.transaction_id,
        }

        return params

    def process_payment_status(self):
        params = self.get_params()

        self.transaction = get_object_or_404(
            PesapalTransaction,
            merchant_reference=self.merchant_reference,
            pesapal_transaction=self.transaction_id,
        )
        # get the task associated to update the payment status
        task = self.transaction.task

        # check status from pesapal server
        response = self.get_payment_status(**params)

        # we initilialize this in order to call the functions that complete/reverse task creation payment
        task_creation_transaction = TaskCreationTransaction()

        if response["payment_status"] == "COMPLETED":

            # we call the function below only if payment status is not completed
            # to avoid multiple entries for the same entry, which would occur every time the callback url is called

            if self.transaction.payment_status != 1:
                # 1 stands for completed, see models for more info
                instance_items = {
                    'base_transaction': self.transaction.base_transaction_pesapal,
                }
                # complete task creation payment
                task_creation_transaction.complete_task_creation_payment(
                    **instance_items)

            self.transaction.payment_status = PesapalTransaction.COMPLETED
            self.transaction.payment_method = response["payment_method"]

            # if transaction is complete update task details
            if task:
                task.payment_status = 'paid'
                task.save()

        elif response['payment_status'] == 'PENDING':
            # if transaction is pending update task details to pending
            if task and task != 'pending':
                task.payment_status = 'pending'
                task.save()

        elif response["payment_status"] == "FAILED":
            if self.transaction.payment_status != 2:
                # 2 stands for failed, see models
                # we call this method to reverse student payment posted to bank and pending transactions when payment fails
                # we only call this if this payment has not failed yet to avoid multiple calls if a user access the
                # confirm payment url multiple times
                instance_items = {
                    'base_transaction': self.transaction.base_transaction_pesapal,
                }
                task_creation_transaction.fail_student_payment(
                    **instance_items)

            self.transaction.payment_status = PesapalTransaction.FAILED
            self.transaction.payment_method = response["payment_method"]

            logger.error("Failed Transaction: {}".format(self.transaction))
        elif response["payment_status"] == "INVALID":
            self.transaction.payment_status = PesapalTransaction.INVALID
            logger.error("Invalid Transaction: {}".format(self.transaction))

        self.transaction.save()


class TransactionStatusView(UpdatePaymentStatusMixin, RedirectView):

    permanent = False
    url = None

    def get_redirect_url(self, *args, **kwargs):

        params = self.get_params()
        self.process_payment_status()

        # redirect back to Transaction completed view
        url = reverse("transaction_completed")

        query_dict = QueryDict("", mutable=True)
        query_dict.update(params)
        url += "?" + query_dict.urlencode()

        return url


class IPNCallbackView(UpdatePaymentStatusMixin, PaymentResponseMixin, View):
    def build_ipn_response(self):
        params = self.get_params()
        params["pesapal_notification_type"] = self.request.GET.get(
            "pesapal_notification_type"
        )

        query_dict = QueryDict("", mutable=True)
        query_dict.update(params)
        response = query_dict.urlencode()
        return HttpResponse(response)

    def get(self, request, *args, **kwargs):
        self.process_payment_status()
        response = self.build_ipn_response()
        return response
