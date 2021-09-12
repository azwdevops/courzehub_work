from uuid import uuid4

from django.db.models import Model, UUIDField, BooleanField, CharField, DateTimeField, PositiveSmallIntegerField, SlugField, \
    ForeignKey, PROTECT, OneToOneField, DecimalField
from django.contrib.postgres.fields import CICharField
from django.utils.text import slugify
from django.contrib.auth import get_user_model

from accounting.choices import transaction_type, entry_type, withdrawal_status
from pesapal.models import PesapalTransaction
from work.models import Organization, Task

User = get_user_model()

# parent ledger groups model


class ParentLedgerGroup(Model):
    id = UUIDField(primary_key=True, default=uuid4, editable=False)
    name = CICharField(max_length=150, unique=True, editable=False)
    # we can filter between balance sheet and profit and loss
    is_balance_sheet_item = BooleanField(default=False)
    # we can filter between incomes and expenses
    is_income_item = BooleanField(default=False)
    is_asset_item = BooleanField(default=False)
    description = CharField(max_length=500, null=True)
    created_on = DateTimeField(auto_now_add=True)
    order = PositiveSmallIntegerField(unique=True, null=True, blank=True)

    def __str__(self):
        return self.name


# model for ledger type


class LedgerGroup(Model):
    id = UUIDField(primary_key=True, default=uuid4, editable=False)
    name = CICharField(max_length=80, unique=True)
    slug = SlugField(unique=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    created_by = ForeignKey(User, on_delete=PROTECT,
                            null=True, related_name='ledger_group_creator')
    description = CICharField(max_length=300, null=True)
    order = PositiveSmallIntegerField(unique=True, null=True, blank=True)
    parent_ledger_group = ForeignKey(
        ParentLedgerGroup, on_delete=PROTECT, null=True)
    is_balance_sheet_item = BooleanField(default=False)
    is_income_item = BooleanField(default=False)
    is_asset_item = BooleanField(default=False)
    is_bank_or_cash = BooleanField(default=False)
    is_salary = BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super(LedgerGroup, self).save(*args, **kwargs)

    def __str__(self):
        return self.name


# model for ledger


class Ledger(Model):
    id = UUIDField(primary_key=True, default=uuid4, editable=False)
    ledger_group = ForeignKey(LedgerGroup, on_delete=PROTECT, null=True)
    name = CICharField(max_length=80, unique=True)
    slug = SlugField(unique=True)
    created_at = DateTimeField(auto_now_add=True)
    organization = OneToOneField(Organization, on_delete=PROTECT,
                                 null=True, blank=True, related_name='organization_ledger')
    user_ledger = OneToOneField(User, on_delete=PROTECT,
                                null=True, blank=True, related_name='user_ledger')
    updated_at = DateTimeField(auto_now=True)
    created_by = ForeignKey(User, on_delete=PROTECT,
                            null=True, related_name='ledger_creator')
    description = CICharField(max_length=300, null=True)
    is_balance_sheet_item = BooleanField(default=False)
    is_income_item = BooleanField(default=False)
    is_asset_item = BooleanField(default=False)
    is_bank_or_cash = BooleanField(default=False)
    is_salary = BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super(Ledger, self).save(*args, **kwargs)

    def __str__(self):
        return self.name


# to hold the base transaction details


class BaseTransaction(Model):
    id = UUIDField(primary_key=True, default=uuid4, editable=False)
    transaction_type = CICharField(max_length=100,
                                   choices=transaction_type, null=True)  # receipt or payment or reversal or journal
    # this only applies when base transaction affects pesapal
    pesapal_transaction = OneToOneField(
        PesapalTransaction, on_delete=PROTECT, null=True, related_name='base_transaction_pesapal')
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    created_by = ForeignKey(User, on_delete=PROTECT,
                            null=True, related_name='transaction_creator')
    task = ForeignKey(
        Task, on_delete=PROTECT, null=True, blank=True)  # only applicable if this relates to a task payment
    is_task_transaction = BooleanField(default=False)
    # only applicable if this relates to an organization transaction
    organization = ForeignKey(
        Organization, on_delete=PROTECT, null=True, blank=True)
    amount = DecimalField(max_digits=20, decimal_places=2)
    memo = CICharField(max_length=400, null=True)

    def __str__(self):
        return f'{self.transaction_type} - {self.id}'

# to hold the accounts affected by the base transaction


class TransactionItem(Model):
    id = UUIDField(primary_key=True, default=uuid4, editable=False)
    base_transaction = ForeignKey(
        BaseTransaction, on_delete=PROTECT, null=True)
    ledger = ForeignKey(
        Ledger, on_delete=PROTECT, related_name='ledger_account', null=True)
    entry_type = CICharField(max_length=100, choices=entry_type)
    amount = DecimalField(max_digits=20, decimal_places=2)
    # specifies if specific entry affects bank account/Mpesa
    is_bank_entry = BooleanField(default=False)
    # mostly applicable for banking purpose to indicate is amount has cleared
    has_cleared = BooleanField(default=False)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    memo = CICharField(max_length=400, null=True)

    def __str__(self):
        return f'{self.entry_type} {self.ledger.name}'


# model to hold all organizations funds withdrawals


class OrganizationFundsWithdrawal(Model):
    id = UUIDField(primary_key=True, default=uuid4, editable=False)
    organization = ForeignKey(Organization, on_delete=PROTECT, null=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    amount = DecimalField(max_digits=20, decimal_places=2)
    status = CICharField(
        max_length=30, choices=withdrawal_status, default='Pending')
    # for courzehub instructors, requested by is the same as the instructor thus we use requested by to get instructor
    requested_by = ForeignKey(User, on_delete=PROTECT,
                              null=True, related_name='withdrawal_requested_by', blank=True)
    approved_by = ForeignKey(User, on_delete=PROTECT,
                             null=True, related_name='withdrawal_approved_by', blank=True)  # the one who approved this for dibursement
    cancelled_by = ForeignKey(User, on_delete=PROTECT,
                              null=True, related_name='withdrawal_cancelled_by', blank=True)  # the one who cancelled this in case of issues
    disbursed_by = ForeignKey(User, on_delete=PROTECT,
                              null=True, related_name='withdrawal_disbursed_by', blank=True)  # the one who posts this amount after dibursement
    reversed_by = ForeignKey(User, on_delete=PROTECT,
                             null=True, related_name='withdrawal_reversed_by', blank=True)  # the one who reversed this in case of issues

    # permissions

    class Meta:
        permissions = (
            ('can_approve_withdrawal', 'Can approve withdrawal'),
            ('can_disburse_withdrawal', 'Can disburse withdrawal')
        )

    def __str__(self):
        return f'{self.organization.name}'
