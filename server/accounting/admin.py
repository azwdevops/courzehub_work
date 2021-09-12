from django.contrib.admin import register, ModelAdmin

from accounting.models import ParentLedgerGroup, LedgerGroup, Ledger, BaseTransaction, TransactionItem


@register(ParentLedgerGroup)
class ParentLedgerGroupAdmin(ModelAdmin):
    list_display = ('name',)


@register(LedgerGroup)
class LedgerGroupAdmin(ModelAdmin):
    list_display = ('name',)


@register(Ledger)
class LedgerAdmin(ModelAdmin):
    list_display = ('name', 'ledger_group')


@register(BaseTransaction)
class BaseTransactionAdmin(ModelAdmin):
    list_display = ('id', 'amount')


@register(TransactionItem)
class TransactionItemAdmin(ModelAdmin):
    list_display = ('id', 'ledger', 'amount')
    list_editable = ('ledger',)
