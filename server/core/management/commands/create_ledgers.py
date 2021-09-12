from django.core.management.base import BaseCommand

from accounting.models import ParentLedgerGroup, LedgerGroup, Ledger
from core.views import get_object_or_none


class Command(BaseCommand):
    asset_parent_ledger_groups = ['Fixed Assets', 'Current Assets']
    capital_and_liabilities_parent_ledger_groups = [
        'Capital & Reserves', 'Long Term Liabilities', 'Current Liabilities']

    income_parent_ledger_groups = ['Direct Incomes', 'Indirect Incomes']

    expenses_parent_ledger_groups = ['Direct Expenses', 'Indirect Expenses']

    bank_cash_ledger_groups = ['Bank Accounts', 'Cash Accounts']
    payables_ledger_groups = ['Salary Payables',
                              'Organization Payables', 'Other Payables', 'Worker Payables']

    income_ledger_groups = ['Tasks Commission']

    fees_income_ledgers = ['Tasks Commission Income']

    # tasks payments funds are to be used to make payments to workers upon work completion

    control_ledgers = ['Pending Transactions', 'Tasks Payment Funds']

    bank_ledgers = ['Cashbook']

    def handle(self, **options):
        self.create_parent_assets_ledger_groups()

        self.create_parent_capital_and_liabilities_ledger_groups()

        self.create_payables_ledger_groups()

        self.create_bank_cash_ledger_groups()

        self.create_parent_income_ledger_groups()

        self.create_parent_expense_ledger_groups()

        self.create_income_groups()

        self.create_fees_commission_incomes_ledger()

        self.create_control_ledgers()

        self.create_cashbook_ledger()

    # create assets parent ledger groups
    def create_parent_assets_ledger_groups(self):
        for parent_group in self.asset_parent_ledger_groups:
            try:
                ParentLedgerGroup.objects.create(
                    name=parent_group,
                    is_balance_sheet_item=True,
                    is_asset_item=True
                )
            except:
                pass

    # create capital and liabilities parent ledger groups
    def create_parent_capital_and_liabilities_ledger_groups(self):
        for parent_group in self.capital_and_liabilities_parent_ledger_groups:
            try:
                ParentLedgerGroup.objects.create(
                    name=parent_group,
                    is_balance_sheet_item=True
                )
            except:
                pass

        # create payables ledger groups
    def create_payables_ledger_groups(self):
        parent_ledger_group = get_object_or_none(
            ParentLedgerGroup, name__iexact='Current Liabilities')
        for group in self.payables_ledger_groups:
            try:
                LedgerGroup.objects.create(
                    name=group,
                    parent_ledger_group=parent_ledger_group,
                    is_salary=True if group == 'Salary Payables' else False,
                    is_balance_sheet_item=True
                )
            except:
                pass

    # create bank and cash ledger groups
    def create_bank_cash_ledger_groups(self):
        parent_ledger_group = get_object_or_none(
            ParentLedgerGroup, name__iexact='Current Assets')
        for group in self.bank_cash_ledger_groups:
            try:
                LedgerGroup.objects.create(
                    name=group,
                    parent_ledger_group=parent_ledger_group,
                    is_bank_or_cash=True,
                    is_balance_sheet_item=True,
                    is_asset_item=True
                )
            except:
                pass

    # create parent income ledger groups either direct or indirect
    def create_parent_income_ledger_groups(self):
        for parent_group in self.income_parent_ledger_groups:
            try:
                ParentLedgerGroup.objects.create(
                    name=parent_group,
                    is_income_item=True
                )
            except:
                pass

    # create parent expense ledger groups either direct or indirect
    def create_parent_expense_ledger_groups(self):
        for parent_group in self.expenses_parent_ledger_groups:
            try:
                ParentLedgerGroup.objects.create(
                    name=parent_group,
                    is_income_item=False
                )
            except:
                pass

    # create income groups
    def create_income_groups(self):
        parent_ledger_group = get_object_or_none(
            ParentLedgerGroup, name__iexact='Direct Incomes')
        for ledger_group in self.income_ledger_groups:
            try:
                LedgerGroup.objects.create(
                    name=ledger_group,
                    parent_ledger_group=parent_ledger_group,
                    is_income_item=True
                )
            except:
                pass

    # create fees commissions ledger
    def create_fees_commission_incomes_ledger(self):
        ledger_group = get_object_or_none(
            LedgerGroup, name__iexact='Tasks Commission')

        for ledger in self.fees_income_ledgers:
            try:
                Ledger.objects.create(
                    name=ledger,
                    ledger_group=ledger_group,
                    is_income_item=True
                )
            except:
                pass

    # create control accounts
    def create_control_ledgers(self):
        ledger_group = get_object_or_none(
            LedgerGroup, name__iexact='Other Payables')

        for ledger in self.control_ledgers:
            try:
                Ledger.objects.create(
                    name=ledger,
                    ledger_group=ledger_group,
                    is_balance_sheet_item=True,
                )
            except:
                pass

    # create cashbook ledger

    def create_cashbook_ledger(self):
        ledger_group = get_object_or_none(
            LedgerGroup, name__iexact='Bank Accounts')

        for ledger in self.bank_ledgers:
            try:
                Ledger.objects.create(
                    name=ledger,
                    ledger_group=ledger_group,
                    is_bank_or_cash=True,
                    is_balance_sheet_item=True,
                    is_asset_item=True
                )
            except:
                pass
