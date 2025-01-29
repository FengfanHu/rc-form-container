import React, { Context, ReactElement, useContext } from "react";
import { createForm } from 'rc-form';
import FormContext from './FormContext';
import { FormCreateOption, InternalFormInstance, WrappedFormUtils } from "./interface";

interface ModuleProps {
  WrappedElement: ReactElement;
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
    const { WrappedElement, code, form: _form } = this.props;
    const form = this.context as InternalFormInstance;

    return React.cloneElement(WrappedElement, {
      code,
      form: {
        ..._form,
        ...form
      }
    })
  }
}

export default function ModuleHOC(props: { 
  option?: FormCreateOption | undefined;
  code: any; WrappedElement: ReactElement
}) {
  const { option = {}, code, WrappedElement } = props;
  const form = useContext(FormContext);
  const { handleCallbackRef = (() => {}) } = form?.getInternalHooks?.()!;

  if (!code) throw Error('Module must have a unique code.');
  if (option?.formPropName) throw Error("Module only accept 'formPropName' property to be 'form' ");
  if (!React.isValidElement(WrappedElement)) throw Error(`WrappedElement is not valid React Element.`);

  const ModuleComp = createForm({
    ...option,
    formPropName: 'form',
  })(Module);

  return React.cloneElement(<ModuleComp />, {
    code,
    WrappedElement,
    ref: handleCallbackRef,
  });
}