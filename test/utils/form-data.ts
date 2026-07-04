export function getSubmittedFormData(action: jest.Mock) {
  const submittedValue = action.mock.calls[0]?.[1]

  if (!(submittedValue instanceof FormData)) {
    throw new Error('Expected action to be called with FormData')
  }

  return submittedValue
}
