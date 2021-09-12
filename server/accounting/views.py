from django.views.generic import TemplateView

from rest_framework.response import Response

from pesapal.views import PaymentRequestMixin


# mpesa payment processing


def process_fees_payment_via_mpesa():
    # return true for now before the payments are fully integrated
    return True


# pesapal payment processing
class PaymentView(TemplateView, PaymentRequestMixin):
    template_name = "accounting/payment.html"

    def get_context_data(self, **kwargs):
        taskId = self.kwargs['taskId']
        amount = self.kwargs['amount']
        merchant_ref = self.kwargs['merchant_ref']

        ctx = super(PaymentView, self).get_context_data(**kwargs)

        order_info = {
            "amount": amount,
            'taskId': taskId,
            "description": "Payment for task created",
            "reference": merchant_ref,
            "email": "pesapal@example.com",
        }

        ctx["pesapal_url"] = self.get_payment_url(**order_info)
        return ctx
