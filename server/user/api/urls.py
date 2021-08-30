from django.urls import path
from rest_framework_simplejwt.views import (TokenObtainPairView,
                                            TokenRefreshView)

from user.api import views

urlpatterns = [
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # api urls
    path('signup/', views.register_user,
         name='register_user'),  # register new user
    path('login/', TokenObtainPairView.as_view(),
         name='token_obtain_pair'),  # user login
    path('resend-account-activation-link/', views.resend_user_activation_email,
         name='resend_user_activation_email'),  # resend user activation email
    path('change-user-password/<userId>/', views.change_user_password,
         name='change_user_password'),  # change user password
     
    path('activate-user-account/', views.activate_user_account, name='activate_user_account'), # activate user account
    path('user-request-password-reset/', views.user_request_password_reset, name='user_request_password_reset'), # user request password reset
    path('user-set-new-password/', views.user_set_new_password, name='user_set_new_password'), # user set new password

    # patch urls
    path('update-user-details/<userId>/', views.update_user_details,
         name='update_user_details'),  # update user details

    # get urls
    path('get-user-data/', views.get_user_data,
         name='get_user_data'),  # get user data
]
