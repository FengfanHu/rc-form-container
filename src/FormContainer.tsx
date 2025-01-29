import React, { FC, ReactNode, useImperativeHandle } from 'react';
import useForm from './useForm';
import FormContext from './FormContext';
import { InternalFormInstance } from './interface';

interface FormContainerPropsType {
  autoUpdate?: boolean;
  children: ReactNode | ReactNode[];
  form: InternalFormInstance;
}

const FormContainer: FC<FormContainerPropsType> = React.forwardRef((props, ref) => {
  const { children, form: _form, autoUpdate = true } = props;
  const form = useForm({ form: _form, autoUpdate });

  useImperativeHandle(ref, () => form);

  return <FormContext.Provider value={form}>
    { children }
  </FormContext.Provider>
});

export default FormContainer;
