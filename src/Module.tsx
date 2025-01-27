import React, { ComponentType, Context, useContext } from "react";
import { createForm } from 'rc-form';
import FormContext from './FormContext';
import { FormCreateOption, InternalFormInstance, WrappedFormUtils } from "./interface";

interface ModuleProps {
  WrappedComponent: ComponentType<any>;
  code: any;
  form: WrappedFormUtils;
}

class Module extends React.Component<ModuleProps> {
  public static contextType: Context<InternalFormInstance | null> = FormContext;

  // Auto update fields of current module after update.
  componentDidUpdate(): void {
    if (this.context) {
      const { getInternalHooks } = this.context as InternalFormInstance;
      getInternalHooks()?.updateModuleFields?.();
    }
  }

  render() {
    const { WrappedComponent, code, form: _form } = this.props;
    const form = this.context as InternalFormInstance;

    return <WrappedComponent code={code} form={{
      ..._form,
      ...form, // overwrite original API
    }} />
  }
}

export default function ModuleHOC(props: { 
  option?: FormCreateOption | undefined;
  code: any; WrappedComponent: ComponentType<any>; 
}) {
  const { option = {}, code, WrappedComponent } = props;
  const form = useContext(FormContext);
  const { handleCallbackRef = (() => {}) } = form?.getInternalHooks?.()!;

  if (!code) console.warn('Module must have a unique code.');
  if (option?.formPropName) console.warn("Module only accept 'formPropName' property to be 'form' ");
  const ModuleComp = createForm({
    ...option,
    formPropName: 'form',
  })(Module);

  return React.cloneElement(<ModuleComp />, {
    code,
    WrappedComponent,
    ref: handleCallbackRef,
  });
}