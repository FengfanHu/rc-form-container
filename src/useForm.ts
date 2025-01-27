import React from "react";
import FormStore from "./FormStore";
import { InternalFormInstance, UseFormPropsType } from "./interface";

function useForm(configs: UseFormPropsType = {}): InternalFormInstance {
  const form = configs?.form;
  const autoUpdate = configs?.autoUpdate;
  const formRef = React.useRef<any>();

  if (!formRef.current) {
    if (form) {
      formRef.current = form;
    } else {
      const formStore: FormStore = new FormStore(autoUpdate);
      formRef.current = formStore?.getForm();
    }
  }

  return formRef.current;
}

export default useForm;
