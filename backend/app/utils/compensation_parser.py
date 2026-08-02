import re


def extract_lpa(compensation):

    if not compensation:
        return None

    compensation = compensation.lower().replace(",", "")

    number = re.search(r"\d+(\.\d+)?", compensation)

    if not number:
        return None

    value = float(number.group())

    if "month" in compensation:
        return round((value * 12) / 100000, 2)

    if "stipend" in compensation:
        return round((value * 12) / 100000, 2)

    return value