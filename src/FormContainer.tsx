import React, { FC, ReactNode, useImperativeHandle } from 'react';
import { updateChildren } from './config';
import useForm, { FormStore } from './FormStore';

interface FormContainerPropsType {
  autoUpdate?: boolean;
  children: ReactNode | ReactNode[];
  form: FormStore;
}

const FormContainer: FC<FormContainerPropsType> = React.forwardRef((props, ref) => {
  const { children, form, autoUpdate = true } = props;
  const formStore = useForm({ form, autoUpdate });
  const { handleCallbackRef, overwriteFormAPI, updateModuleFields } = formStore.getInternalHooks();

  useImperativeHandle(ref, () => formStore);

  return children
    ? Array.isArray(children)
      ? children.map(child =>
        updateChildren(
          child,
          {
            cbRef: handleCallbackRef,
            wrappedComponentRef: overwriteFormAPI,
            updateModuleFields: updateModuleFields,
          },
        ),
      )
      : updateChildren(
        children,
        {
          cbRef: handleCallbackRef,
          wrappedComponentRef: overwriteFormAPI,
          updateModuleFields: updateModuleFields,
        },
      )
    : null;
});

export default FormContainer;
