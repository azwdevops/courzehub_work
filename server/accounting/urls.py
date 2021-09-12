from django.urls import path

from accounting import views

urlpatterns = (
    path('make-payment/<taskId>/<amount>/<merchant_ref>/',
         views.PaymentView.as_view(), name='payment'),
)
