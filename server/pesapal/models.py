from __future__ import absolute_import, unicode_literals

import uuid
from django.db.models import UUIDField, IntegerField, DecimalField, DateTimeField, CharField, ForeignKey, PROTECT, Model
from django.utils.translation import ugettext_lazy as _


from work.models import Task


class PesapalTransaction(Model):

    PENDING = 0
    COMPLETED = 1
    FAILED = 2
    INVALID = 3

    TRANSACTION_STATUS = (
        (PENDING, _("Pending")),
        (COMPLETED, _("Completed")),
        (FAILED, _("Failed")),
    )
    pesapal_transaction = UUIDField(
        default=uuid.uuid4, editable=False, primary_key=True)
    merchant_reference = IntegerField(db_index=True)
    amount = DecimalField(decimal_places=2, max_digits=10, null=True)
    created = DateTimeField(auto_now_add=True)
    payment_status = IntegerField(
        choices=TRANSACTION_STATUS, default=PENDING)
    payment_method = CharField(max_length=24, null=True)
    task = ForeignKey(
        Task, on_delete=PROTECT, null=True, blank=True, related_name='task_pesapal_transaction')

    class Meta:
        unique_together = ("merchant_reference",
                           "pesapal_transaction")

    def __str__(self):
        return f'Transaction: {self.pesapal_transaction}, Merchant_Reference: {self.merchant_reference}'
