import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateIncrementablesUSD, calculateLandedCost } from './customsCalculations';
import { validatePedimentoNumber, auditPedimento, SAMPLE_PEDIMENTOS, validateRFC } from './pedimentoValidator';

test('calculateIncrementablesUSD correctly adds freight and insurance for FOB/EXW but not CIF', () => {
  const fobIncr = calculateIncrementablesUSD('FOB', 2000, 300, 150, 50);
  assert.equal(fobIncr, 2500);

  const exwIncr = calculateIncrementablesUSD('EXW', 1800, 200, 0, 0);
  assert.equal(exwIncr, 2000);

  const cifIncr = calculateIncrementablesUSD('CIF', 2000, 300, 100, 0);
  // In CIF, freight & insurance are included in the commercial invoice, only other incrementables add
  assert.equal(cifIncr, 100);
});

test('calculateLandedCost computes customs value, DTA (8 al millar), IGI and IVA 16%', () => {
  const result = calculateLandedCost({
    commercialValueUSD: 10000,
    exchangeRate: 20.0,
    incoterm: 'FOB',
    freightUSD: 1500,
    insuranceUSD: 200,
    handlingUSD: 0,
    otherIncrementablesUSD: 0,
    igiRatePercent: 10, // 10%
    unitsCount: 100,
    targetMarginPercent: 30,
  });

  // Incrementables USD = 1700
  assert.equal(result.incrementablesUSD, 1700);
  // Customs value USD = 11700
  assert.equal(result.customsValueUSD, 11700);
  // Customs value MXN = 11700 * 20 = 234,000
  assert.equal(result.customsValueMXN, 234000);
  // IGI 10% = 23,400
  assert.equal(result.igiAmountMXN, 23400);
  // DTA 8 al millar = 234000 * 0.008 = 1872
  assert.equal(result.dtaAmountMXN, 1872);
  // IVA Base = 234000 + 23400 + 1872 = 259272
  assert.equal(result.ivaBaseMXN, 259272);
  // IVA 16% = 41484 (rounded)
  assert.equal(result.ivaAmountMXN, 41484);
  // Total customs taxes = 23400 + 1872 + 310 + 80 + 41484 = 67146
  assert.equal(result.totalCustomsTaxesMXN, 67146);
  // Cost per unit must be greater than zero
  assert.ok(result.costPerUnitMXN > 0);
  assert.ok(result.suggestedSalePriceMXN > result.costPerUnitMXN);
});

test('validatePedimentoNumber validates 15-digit structure and parts', () => {
  const valid = validatePedimentoNumber('24 16 3840 4 001928');
  assert.equal(valid.valid, true);
  assert.equal(valid.details?.year, '24');
  assert.equal(valid.details?.aduana, '16');
  assert.equal(valid.details?.patente, '3840');

  const invalid = validatePedimentoNumber('12345');
  assert.equal(invalid.valid, false);
});

test('validateRFC recognizes standard Mexican PM and PF formats', () => {
  assert.equal(validateRFC('DTE210419KM8'), true); // Moral (12)
  assert.equal(validateRFC('GOMR8501019A1'), true); // Fisica (13)
  assert.equal(validateRFC('INVALID_RFC'), false);
});

test('auditPedimento flags critical error on EXW pedimento with zero incrementables', () => {
  const exwSample = SAMPLE_PEDIMENTOS[1].data; // Incoterm EXW with fletesUSD = 0
  const report = auditPedimento(exwSample);

  assert.equal(report.isValid, false);
  assert.ok(report.criticalCount >= 1);
  const incotermIssue = report.issues.find(i => i.field === 'incoterm');
  assert.ok(incotermIssue);
  assert.equal(incotermIssue?.severity, 'CRITICAL');
});

test('auditPedimento passes compliant sample pedimento with high score', () => {
  const compliantSample = SAMPLE_PEDIMENTOS[0].data;
  const report = auditPedimento(compliantSample);

  assert.equal(report.criticalCount, 0);
  assert.ok(report.score >= 90);
  assert.equal(report.isValid, true);
});
