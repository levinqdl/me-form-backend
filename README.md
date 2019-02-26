# me-form-backend

compose awesome forms

## Get Started

```
yarn add me-form-backend
// or
npm install me-form-backend
```

## Basic Example

```javascript
import Form, { useFormItem, FormItem, ArrayField } from 'me-form-backend'

const Input = ({ name }) => {
  const { value, onChange } = useFormItem({ name })
  return <input value={value} onChange={onChange} />
}

const App = () => (
  <Form initValue={{ f1: { a: 'a' }, f2: ['', ''] }} onSubmit={formData => {}}>
    <FormItem name="f1">
      <Input name="a" />
    </FormItem>
    <ArrayField name="f2">{({ index }) => <Input name={index} />}</ArrayField>
    <button>submit</button>
  </Form>
)
```

## Form

Form is the root of your form context, it provides form data to FormItem, useFormItem & ArrayField.

### Props:

| Prop      | Description                                                                                   |
| --------- | --------------------------------------------------------------------------------------------- |
| children  | React elements rendered in Form<br/> or render prop: ({submit, error}) => {}                  |
| validator | a callback called before onSubmit, return null for no error or an error descriptor            |
| onSubmit  | callback called when form submit and all validator pass, receive the form data as argument    |
| value     | pass form data from parent component, Form with value and changed props is in controlled mode |
| onChange  | callback used in combination with "value" and is called when form data changes                |
| initValue | initial value for uncontrolled mode                                                           |
| formTag   | bool type, whether render an html form tag, default false |

### Controlled vs Uncontrolled

Form, much like React controls, provides two modes: controlled and uncontroled:

Controlled, pass value & onChange to Form component, onChange will be called whenever form data changes.

```javascript
<Form value={...} onChange={...}>...</Form>
```

Uncontrolled, pass initValue to Form component, you can get form data in submit callback.

```jsx
<Form initValue={...}>...</Form>
```

## useFormItem

useFormItem is a React custom hook. It connects a form control component with Form context

### Input Options

Usualy we just pass all props to useFormItem hook as input is just fine.

| property      | description                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| name          | string for field name                                                                  |
| defaultValue  | used when specified filed is undefined                                                 |
| validator     | callback whenever field value changes, return null as no error, or an error descriptor |
| errorMessages | an object, which keys are validator rules and values are corresponding error messages  |
| requied       | bool, shorthand for required validator                                                 |
| minLength     | number, shorthand for min length validator                                             |

## FormItem & ArrayField

FormItem and ArrayField are designed to handle middle layer fields, like object or array.

### FormItem

FormItem can be used to describe a object field, which transform context value to a sub-field.

```javascript
<Form initValue={{ obj: { a: 'a', b: 'b' } }}>
  <FormItem name="obj">
    <Input name="a" />
    <Input name="b" />
  </FormItem>
</Form>
```

It receives all options of useFormItem as props.

### ArrayField

ArrayField is a shorthand for iterate over an array field, which uses children as render prop for each item's render.

```javascript
<Form initValue={{ arr: ['a', 'b'] }}>
  <ArrayField name="arr">{({ index }) => <Input name={index} />}</ArrayField>
</Form>

/*
render as
<form>
  <input name="a" value="a"/>
  <input name="b" value="b"/>
</form>
*/
```

## Validation & Error

Form, FormItem and useFormItem all receive a validator for form validation.

Validator should receive form data or the field value it has been defined, returns null if no error or error descriptor if any error exists

```typescript
interface ErrorDescriptor {
  rule: string
  message?: string
}

;<Form
  initValue={{ a: 'a', b: 'b' }}
  validator={({ a, b }) =>
    a !== b ? { rule: 'same value', message: 'a should be same as b' } : null
  }
>
  <Input name="a" />
  <Input name="b" />
</Form>
```

Form validation is different from fields validation.

Form validation is triggered when form is to be submitted, and it triggers all fields' validators first, and at last is the validator defined at Form.

Other validators, defined at FormItem or useFormItem, is triggered when the field value changes.
