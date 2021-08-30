import re
import os
from datetime import datetime, timedelta

import jwt

from django.contrib.auth import get_user_model
from django.conf import settings

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response

User = get_user_model()

# keys used for encoding and decoding
# keys used for encoding and decoding
if settings.PRODUCTION:
    token_generation_key = os.environ['TOKEN_GENERATION_SECRET']
else:
    from decouple import config
    token_generation_key = config('TOKEN_GENERATION_SECRET')

# validate password


def validate_password(password):
    regex = re.compile('[@_!#$%^&*()<>?/\|}{~:]')
    if len(password) < 8:
        return "Password must be at least 8 characters", False
    elif re.search('[0-9]', password) is None:
        return "Password must contain a number", False
    elif re.search('[A-Z]', password) is None:
        return "Password must contain an uppercase letter", False
    elif regex.search(password) is None:
        return "Password must contain a special character", False
    else:
        return "", True


# validate to ensure fields (this is a list) are not empty


def fields_empty(fields):
    for field in fields:
        if field.strip() == '':
            return True
    return False


# verify user using django simple jwt
def verify_user(request, userId):
    # we extract the authorization token from the headers
    raw_token = request.META['HTTP_AUTHORIZATION'].split()[1]
    obj = JWTAuthentication()
    validated_token = obj.get_validated_token(raw_token)
    user = obj.get_user(validated_token)
    try:
        new_user = User.objects.get(id=userId)
        if user == new_user:
            return user
        else:
            return None
    except User.DoesNotExist:
        return None


#####################################  GET FUNCTIONS - TO GET OBJECTS FROM THE DATABASE #######################################
# custom function to get object or return none if not found

def get_object_or_none(model_name, **kwargs):
    try:
        obj = model_name.objects.get(**kwargs)
        return obj
    except model_name.DoesNotExist:
        return None



#### TOKEN RELATED GENERATION, ENCODING AND DECODING

# method to generate an encoded token
def generate_encoded_token(**kwargs):
    # kwargs can be any number of arguments in their key value pairs
    payload = {
        **kwargs,
        "exp":datetime.utcnow() + timedelta(hours=24)
    }
    encoded_token = jwt.encode(payload, token_generation_key, algorithm="HS256")
    return encoded_token


# method to decode an encoded token
def decode_token(token):
    try:
        decode_token = jwt.decode(token, token_generation_key, algorithms=["HS256"])
        return decode_token
    except jwt.ExpiredSignatureError:
        return 'expired token'
    except jwt.DecodeError:
        return 'invalid token'


####### return error functions
def unknown_error():
    return Response({'detail': 'An unknown error occurred'}, status=400)