from decimal import Decimal as D


from accounting.models import BaseTransaction, TransactionItem, Ledger
from core.views import get_object_or_none, enfore_double_entry_rule
from pesapal.models import PesapalTransaction


class TaskCreationTransaction():
    def __init__(self):
        pass

    # method to handle initial task creation payment posting awaiting confirmation
    def post_task_creation_payment_base_transaction(self, **kwargs):
        task = kwargs['task']
        transaction = BaseTransaction()
        transaction.pesapal_transaction = get_object_or_none(
            PesapalTransaction, pesapal_transaction=kwargs['pesapal_transaction_id'])

        transaction.transaction_type = 'Receipt'
        transaction.task = task
        transaction.organization = task.organization
        transaction.amount = D(kwargs.get('amount'))
        transaction.is_task_transaction = True
        transaction.memo = 'Task created initiated task creation payment'

        # post transaction item details
        self.post_task_creation_payment_transaction_items(transaction)

    def post_task_creation_payment_transaction_items(self, base_transaction):
        total_debits = 0
        total_credits = 0
        # post to holding account first, which in this case is called Pending Transactions
        item = TransactionItem()
        item.base_transaction = base_transaction
        item.ledger = get_object_or_none(
            Ledger, name__iexact='Pending Transactions')
        item.entry_type = 'Credit'
        item.amount = D(base_transaction.amount)
        total_credits += D(item.amount)

        # post to bank account, though this will be like uncredited receipt until transaction is complete
        bank_item = TransactionItem()
        bank_item.base_transaction = base_transaction
        bank_item.ledger = get_object_or_none(
            Ledger, name__iexact='Cashbook')
        bank_item.entry_type = 'Debit'
        bank_item.amount = D(base_transaction.amount)
        bank_item.is_bank_entry = True
        total_debits += D(bank_item.amount)

        # we call the validate double entry and save transactions if the rule is True
        amounts_kwargs = {
            'base_amount': D(base_transaction.amount),
            'total_debits': total_debits,
            'total_credits': total_credits
        }
        # if this is true save the entries
        if enfore_double_entry_rule(**amounts_kwargs):
            base_transaction.save()
            bank_item.save()
            item.save()
        # at the moment we are not handling the possible error here
        else:
            pass

    # clear task creation payment upon being complete, post to tasks payment funds account
    def complete_task_creation_payment(self, **kwargs):
        base_transaction = kwargs['base_transaction']
        total_debits = 0
        total_credits = 0

        # remove amount from pending transactions in the Pending Transactions account
        debit_item = TransactionItem()
        debit_item.base_transaction = base_transaction
        debit_item.ledger = get_object_or_none(
            Ledger, name__iexact='Pending Transactions')
        debit_item.entry_type = 'Debit'
        debit_item.amount = D(base_transaction.amount)
        total_debits += D(debit_item.amount)

        # post to tasks payment funds ledger
        credit_item = TransactionItem()
        credit_item.base_transaction = base_transaction
        credit_item.ledger = get_object_or_none(
            Ledger, name__iexact='Tasks Payment Funds')
        credit_item.entry_type = 'Credit'
        credit_item.memo = 'Tasks creation payment confirmed'
        credit_item.amount = D(base_transaction.amount)
        total_credits += D(credit_item.amount)

        # we call the validate double entry and save transactions if the rule is True
        amounts_kwargs = {
            'base_amount': D(base_transaction.amount),
            'total_debits': total_debits,
            'total_credits': total_credits
        }
        # if this is true save the entries
        if enfore_double_entry_rule(**amounts_kwargs):
            debit_item.save()
            credit_item.save()

        # at the moment we are not handling th possible error here
        else:
            pass

    # if payment fails, reverse the transaction posted to bank and pending transactions

    def reverse_task_creation_payment(self, **kwargs):
        base_transaction = kwargs['base_transaction']
        total_debits = 0
        total_credits = 0
        item = TransactionItem()
        item.base_transaction = base_transaction
        item.ledger = get_object_or_none(
            Ledger, name__iexact='Pending Transactions')
        item.entry_type = 'Debit'
        item.amount = D(base_transaction.amount)
        total_debits += D(item.amount)

        # reverse amount posted to bank
        bank_item = TransactionItem()
        bank_item.base_transaction = base_transaction
        bank_item.ledger = get_object_or_none(
            Ledger, name__iexact='Cashbook')
        bank_item.entry_type = 'Credit'
        bank_item.amount = D(base_transaction.amount)
        bank_item.is_bank_entry = True
        total_credits += D(bank_item.amount)

        # we call the validate double entry and save transactions if the rule is True
        amounts_kwargs = {
            'base_amount': D(base_transaction.amount),
            'total_debits': total_debits,
            'total_credits': total_credits
        }
        # if this is true save the entries
        if enfore_double_entry_rule(**amounts_kwargs):
            bank_item.save()
            item.save()
        # at the moment we are not handling the possible error here
        else:
            pass
