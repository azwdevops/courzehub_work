from django.contrib.admin import register, ModelAdmin

from pesapal.models import PesapalTransaction


@register(PesapalTransaction)
class PesapalTransactionAdmin(ModelAdmin):
    list_display = ('pesapal_transaction', 'created',
                    'payment_status', 'task')
