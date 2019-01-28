# me-form-backend

compose awesome forms

## Get Started

```
yarn add me-form-backend
// or
npm install me-form-backend
```

## Example

```javascript
import Form, { FormItem } from "me-form-backend"

const Input = ({name}) => (
  <FormItem name={name}>
    {({value, onChange}) => <input value={value} onChange={onChange}>}
  </FormItem>
)

const App = () => (
  <Form initValue={{f1: "", f2: ""}} onSubmit={form => {}}>
    <Input name="f1"/>
    <Input name="f2"/>
    <button>submit</button>
  </Form>
)
```

## Controlled vs Uncontrolled

Form, much like React controls, provides two modes: controlled and uncontroled:

Controlled

```javascript
<Form value={...} onChange={...}>...</Form>
```

Uncontrolled

```javascript
<Form initValue={...}>...</Form>
```

## Multi-layer Form

FormItem can be used as a intermediate layer between Form and Controls, which transform context value to a sub-field.

### ArrayField

ArrayField is a shorthand for iterate over an array field, which uses children as render prop for each item's render

```javascript
<Form value={{arr: ["a", "b"]}}>
  <ArrayField name="arr">{(index) => <Input name="index"/>}</ArrayField>
</Form>
```
