from django.contrib.auth import get_user_model
from django.db.models import Q

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView


from user.api.serializers import RegistrationSerializer, UserSerializer
from core.views import validate_password, fields_empty, verify_user, get_object_or_none,decode_token, unknown_error


# celery tasks
from appemail.tasks import send_user_activation_email_task, send_password_reset_email_task


User = get_user_model()


# function to register new user
@api_view(['POST', ])
@permission_classes([])
def register_user(request):
    if request.method == 'POST':
        data = request.data
        if validate_email(data['email']) is not None:
            return Response({'detail': 'email taken'}, status=400)

        if validate_username(data['username']) is not None:
            return Response({'detail': 'username taken'}, status=400)

        extra_fields = [data['first_name'], data['last_name'],
                        data['password'], data['confirm_password']]

        # ensure that names are submitted
        if fields_empty(extra_fields):
            return Response('fill all fields')

        if data['password'].strip() =='':
            return Response({'detail': 'Password cannot be blank'}, status=400)

        if not data['password'].strip() == data['confirm_password'].strip():
            return Response({'detail': 'Passwords must match'}, status=400)

        if not validate_password(data['password'])[1]:
            return Response({'detail': validate_password(data['password'])[0]}, status=400)

        serializer = RegistrationSerializer(data=data)

        if serializer.is_valid():
            user = serializer.save()
            user.set_password(data['password'])
            user.save()
            # create a task for celery to send user activation email
            user_kwargs = {
                'email': user.email,
                'username': user.username,
                'userId': user.id.hex
            }
            send_user_activation_email_task.delay(**user_kwargs)

            return Response({'detail': 'Success. Check your email for the activation link.'}, status=201)
        else:
            return Response({'detail': 'An error occurred, please try again later'}, status=400)

        return Response(res)


def validate_email(email):
    user = None
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return None
    if user is not None:
        return email


def validate_username(username):
    user = None
    try:
        user = User.objects.get(username__iexact=username)
    except User.DoesNotExist:
        return None
    if user is not None:
        return username

# function to resend user activation email


@api_view(['POST'])
def resend_user_activation_email(request):
    if request.method == 'POST':
        data = request.data
        user = get_object_or_none(User, email__iexact=data['email'])
        if not user:
            return Response({'detail': 'Invalid user email'}, status=400)
        if user.is_active:
            return Response({'detail': 'Your account is already active'}, status=400)
        # create a task for celery to resend user activation email
        user_kwargs = {
            'email': user.email,
            'username': user.username,
            'userId': user.id.hex
        }
        send_user_activation_email_task.delay(**user_kwargs)

        return Response({'detail': 'Email activation sent'}, status=200)



# function to change a user password
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_user_password(request, userId):
    if request.method == 'POST':
        if verify_user(request, userId):
            user = verify_user(request, userId)
            data = request.data
            if user.check_password(data['current_password']):
                if data['new_password'].strip() =='':
                    return Response({'detail': 'New password cannot be blank'}, status=400)
                if data['current_password'].strip() == data['new_password'].strip():
                    return Response({'detail': 'New password must be different'}, status=400)
                elif data['current_password'].strip() != data['new_password'].strip():
                    if validate_password(data['new_password'])[1]:
                        if data['new_password'].strip() == data['confirm_new_password'].strip():
                            user.set_password(data['new_password'])
                            user.save()
                            return Response({'detail': 'Password changed'}, status=200)
                        else:
                            return Response({'detail': 'Passwords must match'}, status=400)
                    else:
                        # return errors found during password validations
                        return Response({'detail': validate_password(data['new_password'])[0]}, status=400)
            else:
                return Response({'detail': 'Current password incorrect'}, status=400)
        else:
            return Response({'detail': 'Invalid user'}, status=400)


# # view to update user data


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_details(request, userId):
    if request.method == 'PATCH':
        if verify_user(request, userId):
            user = User.objects.get(id=userId)
            data = request.data
            # check if username and email are taken
            users = User.objects.filter(Q(username__iexact=data['username']) | Q(email__iexact=data['email'])).exclude(id=user.id)
            if len(users)> 0:
                return Response({'detail': 'Username and email must be unique'}, status=400)
            
            serializer = UserSerializer(user, data=data)
            
            if serializer.is_valid():
                serializer.save()
                user = UserSerializer(user).data
                return Response({'detail': 'Profile updated successfully','user': user}, status=200)
            else:
                return Response(serializer.errors)
        else:
            return Response({'detail': 'Unable to verify credentials'}, status=400)


# using django simple jwt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    if request.method == 'GET':
        raw_token = request.META['HTTP_AUTHORIZATION'].split()[1]
        obj = JWTAuthentication()  # create a class instance first to call the non-static method
        validated_token = obj.get_validated_token(raw_token)
        user = obj.get_user(validated_token)
        if user:
            user_data = UserSerializer(user).data
            return Response({'user': user_data, 'detail': 'success'}, status=200)

        else:
            return Response({'detail': 'user not found'}, status=404)

# activate user account by using the token sent through email
@api_view(['POST'])
@permission_classes([])
def activate_user_account(request):
    data=request.data
    activation_token = data['activation_token']
    token = decode_token(activation_token)
    if token=='invalid token':
        return Response({'detail': 'Invalid token supplied, request a new one'}, status=400)
    elif token=='expired token':
        return Response({'detail':'Expired token, please request a new one'}, status=400)
    elif token:
        # if the token is decoded, we get the userId from token and we try getting the user with this id
        user = get_object_or_none(User, id=token['userId'])
        if not user:
            return Response({'detail': 'Invalid user account'}, status=400)
        if user.is_active:
            return Response({'detail': 'Your account is already active'}, status=400)
        # if not active, activate user account
        user.is_active=True
        user.save()
        return Response({'detail': 'Account activated successfully'}, status=200)
    else:
        return unknown_error()


# function to send password reset email
@api_view(['POST'])
@permission_classes([])
def user_request_password_reset(request):
    data = request.data
    user = get_object_or_none(User, email__iexact=data['email'])
    if not user:
        return Response({'detail': 'Invalid user email'}, status=400)
    
    # create a task for celery to send user password reset email
    user_kwargs = {
        'email': user.email,
        'username': user.username,
        'userId': user.id.hex
    }
    send_password_reset_email_task.delay(**user_kwargs)

    return Response({'detail': 'Password reset instructions sent to mail'}, status=200)


# function to set new password using password reset link
@api_view(['POST'])
@permission_classes([])
def user_set_new_password(request):
    data = request.data
    password_token = data['password_token']
    token = decode_token(password_token)
    if token=='invalid token':
        return Response({'detail': 'Invalid token supplied, request a new one'}, status=400)
    elif token=='expired token':
        return Response({'detail':'Expired token, please request a new one'}, status=400)
    elif token:
        # if the token is decoded, we get the userId from token and we try getting the user with this id
        user = get_object_or_none(User, id=token['userId'])
        if not user:
            return Response({'detail': 'Invalid user account'}, status=400)
        if data['new_password'].strip() =='':
            return Response({'detail': 'Password cannot be blank'}, status=400)
        
        if data['new_password'].strip() != data['confirm_password'].strip():
            return Response({'detail': 'Passwords must match'}, status=400)

        if not validate_password(data['new_password'])[1]:
            return Response({'detail': validate_password(data['new_password'])[0]}, status=400)

        user.set_password(data['new_password'])
        user.save()
        return Response({'detail': 'Password set successfully'}, status=200)
    else:
        return unknown_error()

# class based views

