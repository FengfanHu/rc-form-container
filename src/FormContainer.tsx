import React, { FC, ReactNode, useImperativeHandle } from 'react';
import { updateChildren } from './config';
import useForm, { FormStore } from './FormStore';

interface FormContainerPropsType {
  autoProxy?: boolean;
  autoUpdate?: boolean;
  children: ReactNode | ReactNode[];
  form: FormStore;
}

const FormContainer: FC<FormContainerPropsType> = React.forwardRef((props, ref) => {
  const { children, form, autoProxy = true, autoUpdate = false } = props;
  const formStore = useForm({ form, options: { autoProxy, autoUpdate } });

  useImperativeHandle(ref, () => formStore);

  return children
    ? Array.isArray(children)
      ? children.map(child =>
        updateChildren(
          child,
          {
            cbRef: formStore.handleCallbackRef,
            wrappedComponentRef: formStore.overwriteFormAPI,
            updateModuleFields: formStore.updateModuleFields,
          },
        ),
      )
      : updateChildren(
        children,
        {
          cbRef: formStore.handleCallbackRef,
          wrappedComponentRef: formStore.overwriteFormAPI,
          updateModuleFields: formStore.updateModuleFields,
        },
      )
    : null;
});

export default FormContainer;
