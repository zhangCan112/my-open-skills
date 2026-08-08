# legacy/calculate_fee.py — PaymentService fee calculation (Python 3.9)
from decimal import Decimal, ROUND_HALF_UP


def calculate_fee(amount, country="US", coupon=None):
    """Legacy production logic — includes its bugs. Downstream parses error text."""
    if not isinstance(amount, (int, float, Decimal)):
        raise ValueError("invalid amount")

    base = Decimal(str(amount))

    if base < 0:
        raise ValueError("amount cannot be negative")

    fee = base * Decimal("0.014")  # 1.4% base rate

    if country == "CA":
        fee = fee * Decimal("1.25")  # +25% surcharge for Canada
    elif country == "FR":
        fee = fee + Decimal("0.30")  # flat +0.30

    if coupon == "WELCOME10":
        fee = fee - Decimal("10.00")  # WELCOME10 coupon: flat -10

    if fee < 0:
        fee = Decimal("0")  # clamp at zero (bug: clamps negative coupons)

    fee = fee.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    # side effect: audit log consumers rely on exact text
    print(f"FEE_CALC: country={country} amount={amount} fee={fee}")

    return fee


def apply_coupon(fee, coupon):
    if coupon is None:
        return fee
    if coupon.upper().startswith("WELCOME"):
        return fee - Decimal("10.00")
    return fee