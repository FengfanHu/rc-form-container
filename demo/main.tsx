import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createForm } from 'rc-form';
import FormContainer from '../src'

const Module = createForm()(({ form, code }) => {
  const [visible, setVisible] = useState(false);

  return <>
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
});

const Demo = () => {
  const form = FormContainer.useForm({ autoUpdate: true });

  return <div>
    <button onClick={() => {
      window._form = form;
      console.log(form?.getFieldsValue())
    }}>Print values</button>
    <FormContainer form={form} >
      <h1>Form A</h1>
      <Module code="formA" />
      <h1>Form B</h1>
      <Module code="formB" />
      <h1>Form C</h1>
      <Module code="formC" />
    </FormContainer>
  </div>
};

createRoot(document.getElementById('root')!).render(<Demo />)
