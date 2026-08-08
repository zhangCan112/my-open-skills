// svc/payments/fee.go — Go rewrite of calculate_fee (v2)
package payments

import (
	"fmt"
	"math"
)

// CalculateFee mirrors legacy calculate_fee.
func CalculateFee(amount float64, country string, coupon string) (float64, error) {
	if math.IsNaN(amount) || math.IsInf(amount, 0) {
		return 0, fmt.Errorf("invalid amount")
	}

	if amount < 0 {
		return 0, fmt.Errorf("amount cannot be negative")
	}

	fee := amount * 0.014

	if country == "CA" {
		fee *= 1.25
	} else if country == "FR" {
		fee += 0.30
	}

	if coupon == "WELCOME10" {
		fee -= 10.0
	}

	if fee < 0 {
		fee = 0
	}

	// NOTE: float64, no quantize — rounding differs from legacy ROUND_HALF_UP
	fee = math.Round(fee*100) / 100

	// audit log
	fmt.Printf("FEE_CALC: country=%s amount=%.2f fee=%.2f\n", country, amount, fee)

	return fee, nil
}