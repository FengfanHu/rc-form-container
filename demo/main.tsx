import React from 'react'
import { createRoot } from 'react-dom/client'
import { createForm } from 'rc-form';
import FormContainer from '../src'

const Module = createForm()(({ form, code }) => {

  return <>
    {
      Array.from((new Array(100)), (_, index) => index)?.map((i) => {
        return (form as any)?.getFieldDecorator(`${code}_field_${i}`, {})(<input />)
      })
    }
  </>
});

const Demo = () => {
  const form = FormContainer.useForm();

  return <FormContainer form={form} >
    <h1>Form A</h1>
    <Module code="formA" />
    <h1>Form B</h1>
    <Module code="formB" />
    <h1>Form C</h1>
    <Module code="formC" />
  </FormContainer>
};

createRoot(document.getElementById('root')!).render(<Demo />)
