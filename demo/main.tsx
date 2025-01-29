import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import FormContainer from '../src'
import Module from '../src/Module';

const FormA = ({ form, code }) => {
  const [visible, setVisible] = useState(false);

  return <>
    <button onClick={() => setVisible((v) => !v)}>Show/Hide field</button>
    {
      Array.from((new Array(20)), (_, index) => index)?.map((i) => {
        return (form as any)?.getFieldDecorator(`${code}_field_${i}`, {})(<input />)
      })
    }
    {
      visible && (form as any)?.getFieldDecorator(`${code}_hidden_field`, {
        onChange: (e) => {
          form.reRenderModules(['formB'])
        }
      })(<input name={`${code}_hidden_field`} placeholder='Hidden' />)
    }
  </>
};

const FormB = ({ form, code }) => {
  const [visible, setVisible] = useState(false);
  const formA__hidden_field = form.getFieldValue('formA_hidden_field');

  return <>
    <div>formA__hidden_field: {formA__hidden_field}</div>
    <button onClick={() => setVisible((v) => !v)}>Show/Hide field</button>
    {
      Array.from((new Array(20)), (_, index) => index)?.map((i) => {
        return (form as any)?.getFieldDecorator(`${code}_field_${i}`, {})(<input />)
      })
    }
    {
      visible && (form as any)?.getFieldDecorator(`${code}_hidden_field`, {})(<input placeholder='Hidden' />)
    }
  </>
};

const Demo = () => {
  const form = FormContainer.useForm({ autoUpdate: true });

  return <div>
    <div>
      <button onClick={() => {
        window._form = form;
        console.log(form?.getFieldsValue())
      }}>Print values</button>
    </div>
    <FormContainer form={form} >
      <h1>Form A</h1>
      <Module code="formA" WrappedComponent={FormA} />
      <h1>Form B</h1>
      <Module code="formB" WrappedComponent={FormB} />
    </FormContainer>
  </div>
};

createRoot(document.getElementById('root')!).render(<Demo />)
