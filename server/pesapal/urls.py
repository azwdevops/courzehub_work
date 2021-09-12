from django.urls import path


from pesapal import views

urlpatterns = (
    path('transaction/completed/', views.TransactionCompletedView.as_view(),
         name='transaction_completed'),
    path('transaction/status/', views.TransactionStatusView.as_view(),
         name='transaction_status'),
    path('transaction/completed/',
         views.IPNCallbackView.as_view(), name='transaction_ipn'),
)
