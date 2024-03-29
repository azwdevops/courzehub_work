from django.conf import settings

if settings.configured:
    PESAPAL_DEMO = getattr(settings, "PESAPAL_DEMO", True)
    # to allow checking if production is True
    PRODUCTION = getattr(settings, 'PRODUCTION')

    if PESAPAL_DEMO:
        PESAPAL_IFRAME_LINK = getattr(
            settings,
            "PESAPAL_IFRAME_LINK",
            "http://demo.pesapal.com/api/PostPesapalDirectOrderV4",
        )
        PESAPAL_QUERY_STATUS_LINK = getattr(
            settings,
            "PESAPAL_QUERY_STATUS_LINK",
            "http://demo.pesapal.com/API/QueryPaymentDetails",
        )
    else:
        PESAPAL_IFRAME_LINK = getattr(
            settings,
            "PESAPAL_IFRAME_LINK",
            "https://www.pesapal.com/api/PostPesapalDirectOrderV4",
        )
        PESAPAL_QUERY_STATUS_LINK = getattr(
            settings,
            "PESAPAL_QUERY_STATUS_LINK",
            "https://www.pesapal.com/API/QueryPaymentDetails",
        )

    PESAPAL_CONSUMER_KEY = getattr(settings, "PESAPAL_CONSUMER_KEY", "")
    PESAPAL_CONSUMER_SECRET = getattr(settings, "PESAPAL_CONSUMER_SECRET", "")

    PESAPAL_OAUTH_CALLBACK_URL = getattr(
        settings, "PESAPAL_OAUTH_CALLBACK_URL", "transaction_completed"
    )

    PESAPAL_OAUTH_SIGNATURE_METHOD = getattr(
        settings, "PESAPAL_OAUTH_SIGNATURE_METHOD", "SignatureMethod_HMAC_SHA1"
    )

    PESAPAL_TRANSACTION_DEFAULT_REDIRECT_URL = getattr(
        settings, "PESAPAL_TRANSACTION_DEFAULT_REDIRECT_URL", "/"
    )

    PESAPAL_TRANSACTION_FAILED_REDIRECT_URL = getattr(
        settings,
        "PESAPAL_TRANSACTION_FAILED_REDIRECT_URL",
        PESAPAL_TRANSACTION_DEFAULT_REDIRECT_URL,
    )

    PESAPAL_REDIRECT_WITH_REFERENCE = False

    PESAPAL_TRANSACTION_MODEL = getattr(
        settings, "PESAPAL_TRANSACTION_MODEL", "pesapal.Transaction"
    )
