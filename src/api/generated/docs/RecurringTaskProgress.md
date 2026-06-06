
# RecurringTaskProgress


## Properties

Name | Type
------------ | -------------
`id` | string
`email` | string
`allTasksStreak` | number
`lastCheckedAt` | Date

## Example

```typescript
import type { RecurringTaskProgress } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "email": null,
  "allTasksStreak": 4,
  "lastCheckedAt": 2026-06-07T00:00Z,
} satisfies RecurringTaskProgress

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecurringTaskProgress
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


