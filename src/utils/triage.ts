export type PriorityLevel = 'Emergency' | 'Urgent' | 'Normal'

export type VitalInputs = {
  systolicBp: number
  heartRate: number
  temperature: number
  spo2: number
}

export function calculatePriority({
  systolicBp,
  heartRate,
  temperature,
  spo2
}: VitalInputs): PriorityLevel {
  let newPriority: PriorityLevel = 'Normal'

  const sys = Number.isFinite(systolicBp) ? systolicBp : 0
  const heart = Number.isFinite(heartRate) ? heartRate : 0
  const temp = Number.isFinite(temperature) ? temperature : 0
  const oxygen = Number.isFinite(spo2) ? spo2 : 0

  if (!sys && !heart && !temp && !oxygen) {
    return newPriority
  }

  // Emergency criteria (Red)
  if (
    (sys > 0 && (sys <= 90 || sys >= 220)) ||
    (heart > 0 && (heart <= 40 || heart >= 130)) ||
    (temp > 0 && (temp <= 35 || temp >= 39.1)) ||
    (oxygen > 0 && oxygen <= 91)
  ) {
    newPriority = 'Emergency'
  }
  // Urgent criteria (Orange)
  else if (
    (sys > 0 && (sys <= 100 || sys >= 200)) ||
    (heart > 0 && (heart <= 50 || heart >= 110)) ||
    (temp > 0 && (temp <= 36 || temp >= 38.1)) ||
    (oxygen > 0 && oxygen <= 95)
  ) {
    newPriority = 'Urgent'
  }

  return newPriority
}

