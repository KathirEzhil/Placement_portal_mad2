import redis
import json

redis_client = redis.Redis(
    host="localhost",
    port=6379,
    db=1,
    decode_responses=True
)


def get_cache(key):
    data = redis_client.get(key)

    if data:
        return json.loads(data)

    return None


def set_cache(key, data, timeout=300):

    redis_client.setex(
        key,
        timeout,
        json.dumps(data)
    )


def delete_cache(key):

    redis_client.delete(key)


def clear_admin_cache():

    keys = redis_client.keys("admin_*")

    if keys:
        redis_client.delete(*keys)


def clear_admin_management_cache():

    delete_cache("admin_recruitment")
    delete_cache("admin_students")