
/**
 * Parses form errors into human-readable text
 * @param errors
 */
export function parseFormErrors(errors: { [name: string]: any }|null): string[] {
  if (!errors) return [];

  const result = [];
  let unknown = false;

  for (const name in errors) {
    if (!errors.hasOwnProperty(name)) continue;
    const val = errors[name];

    switch (name) {
      case 'required':
        result.push('Field is required');
        break;
      case 'minlength':
        const minLength = val as { requiredLength: number, actualLength: number };
        result.push(`A minimum length of ${minLength.requiredLength} is required [${minLength.actualLength}/${minLength.requiredLength}]`);
        break;
      case 'email':
        result.push('This is not a valid email');
        break;
      case 'max':
        result.push(`The maximum value is: ${val.max}`);
        break;
      case 'min':
        result.push(`The minimum value is: ${val.min}`);
        break;
      case 'error':
        result.push(val as string);
        break;
      default:
        console.log(name, val);
        unknown = true;
        break;
    }
  }

  if (unknown && result.length < 1)
    result.push('The field is not correct');

  return result;
}
