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

const Input = props => {
  const { value, onChange, rest } = useFormItem(props)
  return <input {...rest} value={value} onChange={onChange} />
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

| Prop          | Description                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| children      | React elements rendered in Form<br/> or render prop: ({submit, value, error}) => {}                     |
| validator     | a callback called before onSubmit, return null for no error or an error descriptor                      |
| onSubmit      | callback called when form submit and all validator pass, receive the form data as argument              |
| value         | pass form data from parent component, Form with value and changed props is in controlled mode           |
| onChange      | callback used in combination with "value" and is called when form data changes                          |
| initValue     | initial value for uncontrolled mode                                                                     |
| defaultValue  | gets merged into initValue or value on some undefined field, usefull for some field is missing in value |
| formTag       | bool type, whether render an html form tag, default false                                               |
| errorMessages | an object, which keys are validator rules and values are corresponding error messages                   |

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

### Why defaultValue can't be set on fields

Because currently in React there's not a good way that a parent component can read props from descendant components, so in the first render the defaultValue prop of a field can't be available from value of ancestors. This can be confusing and this is against the data flow model of React.

## useFormItem

useFormItem is a React custom hook. It connects a form control component with Form context

### Input Options

Usualy we just pass all props to useFormItem hook as input is just fine, useFormItem forwards all unknown props, but you may want to control it, all used props listed below:

| property      | description                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| name          | string for field name                                                                                                            |
| validator     | callback whenever field value changes, return null as no error, or an error descriptor                                           |
| errorMessages | an object, which keys are validator rules and values are corresponding error messages                                            |
| requied       | bool, shorthand for required validator                                                                                           |
| minLength     | number, shorthand for min length validator                                                                                       |
| label         | ReactNode, it will be passed to dynamic error message function                                                                   |
| parse         | a function called when field value changes, receive changed value, can be used like trim input or parse date from string         |
| format        | a function called when pass value to control component, receive current value, can be used when format date to string            |
| interceptor   | [Deprecated] use `parse` instead. A function called when field value changes, receive changed value, can be used like trim input |
| didUpdate     | a callback that called when a field is confirmed to change, receive changed value and a patch fucntion                           |

#### didUpdate v.s. interceptor

- interceptor is called right before a field value is changed, and it only provide the changed value. It's easy to use, but only can change the changed value
- didUpdate is called before the changed value is committed, aka set the Form internal state in uncontrolled mode or call onChange prop of Form in controlled mode. It is provide the changed value and a patch function for the Form value, you can use the patch function change or remove any other fields of the Form, it's useful when you want to accomplish associated field changing

```javascript
<Form initValue={{a: "", b: ""}}>
<Input
  ...
  name="a"
  didUpdate={(changedValue, patch) => {
    if (changedValue) {
      patch({b: "b also changed", c: "c added"}) // when a changing to true, set b and add c
    } else {
      patch({b: ""}, "c") // when a changing to false, reset b, and remove c
    }
  }}
/>
</Form>

```

### Output Options

| property   | description                                                                                                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| value      | field value                                                                                                                                                                            |
| onChange   | onChange callback                                                                                                                                                                      |
| error      | error descriptor of current field, null if no error                                                                                                                                    |
| resetError | a callback to clear current error                                                                                                                                                      |
| label      | identical label passed to the hook                                                                                                                                                     |
| id         | a dot concated string of all ancestors' name and the current field name, you can pass it to <label> as _for_ attribute and a control id attribute to associate a <label> and a control |

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

Validator should receive form data or the field value it has been defined, returns null if no error or error descriptor if any error exists.

### ErrorDescriptor

- _rule_ defines the type of the error, it's used to find error message or to decide whether the error is ralated a field.
- _message_ can be a plain string, if not provided, error message will be computed from errorMessages.
- _labels_ is an array of field labels passed to message format funcion above metioned, if not provided, field label prop will be used.

```typescript
interface ErrorDescriptor {
  rule: string
  message?: string
  labels?: ReactNode[] // string or react element
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

### ErrorMessages

ErrorMessages is an object, which keys are validator rules and values are corresponding error messages.

Value can be a plain string or a function which receive field labels and return a string.

ErrorMessages can be config at multiple level: Form, FormItem or Control, it is merged from top level to deepest level, and later one override message of the smae rule.

### Trigger timing

Form validation is different from fields validation at trigger timing.

Form validation is triggered when form is to be submitted, and it triggers all fields' validators first, and at last is the validator defined at Form.

Other validators, defined at FormItem or useFormItem, is triggered when the field value changes.

## Recipes

### parse & format

```jsx
const DateInput = () => (
  <Input
    parse={date => date.format('YYYY-MM-DD')}
    format={s => moment(s, 'YYYY-MM-DD')}
  />
)
```
