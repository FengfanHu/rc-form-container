import scrollIntoView from 'dom-scroll-into-view';
import React, { ReactElement, ReactInstance } from 'react';
import * as ReactDOM from 'react-dom';
import { getParams, getScrollableContainer, validateFuncWrapper } from './config';

export type ValidationRule = {
  /** validation error message */
  message?: React.ReactNode;
  /** built-in validation type, available options: https://github.com/yiminghe/async-validator#type */
  type?: string;
  /** indicates whether field is required */
  required?: boolean;
  /** treat required fields that only contain whitespace as errors */
  whitespace?: boolean;
  /** validate the exact length of a field */
  len?: number;
  /** validate the min length of a field */
  min?: number;
  /** validate the max length of a field */
  max?: number;
  /** validate the value from a list of possible values */
  enum?: string | string[];
  /** validate from a regular expression */
  pattern?: RegExp;
  /** transform a value before validation */
  transform?: (value: any) => any;
  /** custom validate function (Note: callback must be called) */
  validator?: (rule: any, value: any, callback: any, source?: any, options?: any) => any;
};

export type ValidateCallback<V> = (errors: any, values: V) => void;

export type GetFieldDecoratorOptions = {
  /** 子节点的值的属性，如 Checkbox 的是 'checked' */
  valuePropName?: string;
  /** 子节点的初始值，类型、可选值均由子节点决定 */
  initialValue?: any;
  /** 收集子节点的值的时机 */
  trigger?: string;
  /** 可以把 onChange 的参数转化为控件的值，例如 DatePicker 可设为：(date, dateString) => dateString */
  getValueFromEvent?: (...args: any[]) => any;
  /** Get the component props according to field value. */
  getValueProps?: (value: any) => any;
  /** 校验子节点值的时机 */
  validateTrigger?: string | string[];
  /** 校验规则，参见 [async-validator](https://github.com/yiminghe/async-validator) */
  rules?: ValidationRule[];
  /** 是否和其他控件互斥，特别用于 Radio 单选控件 */
  exclusive?: boolean;
  /** Normalize value to form component */
  normalize?: (value: any, prevValue: any, allValues: any) => any;
  /** Whether stop validate on first rule of error for this field.  */
  validateFirst?: boolean;
  /** 是否一直保留子节点的信息 */
  preserve?: boolean;
};

/** dom-scroll-into-view 组件配置参数 */
export type DomScrollIntoViewConfig = {
  /** 是否和左边界对齐 */
  alignWithLeft?: boolean;
  /** 是否和上边界对齐  */
  alignWithTop?: boolean;
  /** 顶部偏移量 */
  offsetTop?: number;
  /** 左侧偏移量 */
  offsetLeft?: number;
  /** 底部偏移量 */
  offsetBottom?: number;
  /** 右侧偏移量 */
  offsetRight?: number;
  /** 是否允许容器水平滚动 */
  allowHorizontalScroll?: boolean;
  /** 当内容可见时是否允许滚动容器 */
  onlyScrollIfNeeded?: boolean;
};

export type ValidateFieldsOptions = {
  /** 所有表单域是否在第一个校验规则失败后停止继续校验 */
  first?: boolean;
  /** 指定哪些表单域在第一个校验规则失败后停止继续校验 */
  firstFields?: string[];
  /** 已经校验过的表单域，在 validateTrigger 再次被触发时是否再次校验 */
  force?: boolean;
  /** 定义 validateFieldsAndScroll 的滚动行为 */
  scroll?: DomScrollIntoViewConfig;
};

export type WrappedFormUtils<V = any> = {
  /** 获取一组输入控件的值，如不传入参数，则获取全部组件的值 */
  getFieldsValue(fieldNames?: Array<string>): { [field: string]: any };
  /** 获取一个输入控件的值 */
  getFieldValue(fieldName: string): any;
  /** 设置一组输入控件的值 */
  setFieldsValue(obj: object, callback?: Function): void;
  /** 设置一组输入控件的值 */
  setFields(obj: object): void;
  /** 校验并获取一组输入域的值与 Error */
  validateFields(
    fieldNames: Array<string>,
    options: ValidateFieldsOptions,
    callback: ValidateCallback<V>,
  ): void;
  validateFields(options: ValidateFieldsOptions, callback: ValidateCallback<V>): void;
  validateFields(fieldNames: Array<string>, callback: ValidateCallback<V>): void;
  validateFields(fieldNames: Array<string>, options: ValidateFieldsOptions): void;
  validateFields(fieldNames: Array<string>): void;
  validateFields(callback: ValidateCallback<V>): void;
  validateFields(options: ValidateFieldsOptions): void;
  validateFields(): void;
  /** 与 `validateFields` 相似，但校验完后，如果校验不通过的菜单域不在可见范围内，则自动滚动进可见范围 */
  validateFieldsAndScroll(
    fieldNames: Array<string>,
    options: ValidateFieldsOptions,
    callback: ValidateCallback<V>,
  ): void;
  validateFieldsAndScroll(options: ValidateFieldsOptions, callback: ValidateCallback<V>): void;
  validateFieldsAndScroll(fieldNames: Array<string>, callback: ValidateCallback<V>): void;
  validateFieldsAndScroll(fieldNames: Array<string>, options: ValidateFieldsOptions): void;
  validateFieldsAndScroll(fieldNames: Array<string>): void;
  validateFieldsAndScroll(callback: ValidateCallback<V>): void;
  validateFieldsAndScroll(options: ValidateFieldsOptions): void;
  validateFieldsAndScroll(): void;
  /** 获取某个输入控件的 Error */
  getFieldError(name: string): string[] | undefined;
  getFieldsError(names?: Array<string>): Record<string, string[] | undefined>;
  /** 判断一个输入控件是否在校验状态 */
  isFieldValidating(name: string): boolean;
  isFieldTouched(name: string): boolean;
  isFieldsTouched(names?: Array<string>): boolean;
  /** 重置一组输入控件的值与状态，如不传入参数，则重置所有组件 */
  resetFields(names?: Array<string>): void;
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  getFieldDecorator<T extends object = {}>(
    id: keyof T,
    options?: GetFieldDecoratorOptions,
  ): (node: React.ReactNode) => React.ReactNode;
};

interface FormInstance extends WrappedFormUtils, ReactElement {
  fieldsStore: {
    fieldsMeta: {
      [key: string]: {
        name: string;
        trigger: string;
      }
    }
    fields: {
      [key: string]: {
        errors?: any;
        value?: any;
      }
    }
  };
  setFieldsValue: (obj: object, callback?: () => void) => void;
  forceUpdate: (callback?: () => void) => void;
  getFieldInstance: (fieldName: string) => ReactInstance | null;
}

class FormStore {
  constructor(autoUpdate: boolean = true) {
    this.autoUpdate = autoUpdate;
    this.moduleRefs = new Map();
    this.fieldModuleMap = new Map();
  }

  private readonly autoUpdate: boolean;
  private readonly moduleRefs: Map<string, FormInstance>;
  private fieldModuleMap: Map<string, any>;

  // CallbackRef for form component
  private handleCallbackRef = (child: ReactElement) => {
    const code = child?.props?.code;
    if (!code) throw new Error(`Component ${(child?.type as any)?.displayName || 'Unknown'} must set 'code' property.`);

    return (component: FormInstance) => {
      if (!component) {
        this.moduleRefs.delete(code);
        this.clearFieldModuleMap(code);
        return;
      }
      if (this.moduleRefs.has(code)) throw new Error(`Duplicate form code: ${code}.`);
      this.moduleRefs.set(code, component);
      this.initializeModuleFields(code);
    };
  };

  // Overwrite the form API in each form component, the origin API is take over
  private overwriteFormAPI = (instance: ReactElement) => {
    if (instance?.props?.form) {
      instance.props.form.getFieldsValue = this.getFieldsValue;
      instance.props.form.getFieldValue = this.getFieldValue;
      instance.props.form.setFieldsValue = this.setFieldsValue;
      instance.props.form.reRenderModules = this.reRenderModules;
      instance.props.form.validateFields = this.validateFields;
      instance.props.form.validateFieldsAndScroll = this.validateFieldsAndScroll;
    }
  };

  // Clear up field module map
  private clearFieldModuleMap = (moduleDefineCode: string) => {
    for (const [k, v] of this.fieldModuleMap.entries()) {
      if (v === moduleDefineCode) {
        this.fieldModuleMap.delete(k);
      }
    }
  };

  // Initialize module fields map
  private initializeModuleFields = (moduleDefineCode: string) => {
    const moduleRef = this.moduleRefs.get(moduleDefineCode);
    const fieldsMeta = moduleRef?.fieldsStore?.fieldsMeta || {};

    Object.keys(fieldsMeta).forEach(fieldName => {
      if (this.isFieldRegistered(fieldName))
        throw new Error(
          `Field ${fieldName} already exists in module ${this.fieldModuleMap.get(
            fieldName,
          )} with code ${moduleDefineCode}`,
        );
      this.fieldModuleMap.set(fieldName, moduleRef?.props?.code);
    });
  };

  /**
   * Update module fields, if there is no fields change it's no need to update
   */
  private updateModuleFields = () => {
    const newFieldModuleMap = new Map();
    for (const [moduleDefineCode, moduleRef] of this.moduleRefs.entries()) {
      const fieldsMeta = moduleRef?.fieldsStore?.fieldsMeta || {};
      Object.keys(fieldsMeta).forEach(fieldName => {
        if (newFieldModuleMap.has(fieldName))
          throw new Error(
            `Field ${fieldName} already exists in module ${this.fieldModuleMap.get(
              fieldName,
            )} with code ${moduleDefineCode}`,
          );
        newFieldModuleMap.set(fieldName, moduleRef?.props?.code);
      });
    }
    this.fieldModuleMap = newFieldModuleMap;
  };

  private getFieldsUnion = (fieldNames: string[]): Map<string, string[]> => {
    const fieldsUnion = new Map();

    fieldNames.forEach(fieldName => {
      if (!this.isFieldRegistered(fieldName)) {
        console.error(`FormContainer-getFieldsUnion: ${fieldName} doesn't exist.`);
        return; 
      }
      const moduleName: string = this.fieldModuleMap.get(fieldName);
      if (!fieldsUnion.has(moduleName)) {
        fieldsUnion.set(moduleName, [fieldName]);
      } else {
        fieldsUnion.get(moduleName).push(fieldName);
      }
    });

    return fieldsUnion;
  };

  // Auto update helper function to ensure fields are always fresh.
  private updateBeforeAction = (fn: Function): Function => {
    return (...args: any) => {
      if (this.autoUpdate) this.updateModuleFields();
      return fn(...args);
    }
  }

  /**
   * Check whether field exists in the form
   * @param {string} fieldName
   */
  private isFieldRegistered = (fieldName: string): boolean => {
    return this.fieldModuleMap.has(fieldName);
  }

  /**
   * getFieldsValue
   * @param {string[]} fieldNames
   */
  private getFieldsValue = this.updateBeforeAction((fieldNames?: string[]): Record<string, any> => {
    if (!fieldNames || fieldNames?.length === 0) {
      return (
        Array.from(this.moduleRefs.values()).reduce(
          (acc: any, moduleRef) => Object.assign(acc, moduleRef.getFieldsValue()),
          {},
        ) || {}
      );
    }
    return fieldNames.reduce((acc: any, fieldName: any) => {
      acc[fieldName] = this.getFieldValue(fieldName);
      return acc;
    }, {});
  });

  /**
   * getFieldValue
   * @param {string} fieldName
   */
  private getFieldValue = this.updateBeforeAction((fieldName: string): any => {
    if (!this.isFieldRegistered(fieldName)) {
      console.warn(`FormContainer-getFieldValue: ${fieldName} doesn't exist.`);
    }
    const moduleName = this.fieldModuleMap.get(fieldName);
    return this.moduleRefs.get(moduleName)?.getFieldValue(fieldName);
  });

  /**
   * setFieldsValue
   * @param {Record<string, any>} fieldsValue
   * @param {Function} callback
   */
  private setFieldsValue = this.updateBeforeAction((fieldsValue: { [key: string]: any }, callback: () => void): void => {
    const fieldsUnion = this.getFieldsUnion(Object.keys(fieldsValue));

    for (const [moduleName, fieldNames] of fieldsUnion.entries()) {
      const moduleRef = this.moduleRefs.get(moduleName);
      moduleRef?.setFieldsValue(
        (fieldNames as string[]).reduce((acc: { [key: string]: any }, fieldName) => {
          acc[fieldName] = fieldsValue[fieldName];
          return acc;
        }, {}),
        callback,
      );
    }
  });

  /**
   * resetFields
   * @param {string[]} fieldNames
   */
  private resetFields = (fieldNames: string[]) => {
    if (!fieldNames || fieldNames?.length === 0) {
      Array.from(this.moduleRefs.values()).forEach(moduleRef => {
        moduleRef.resetFields();
      });
      return;
    }

    const fieldsUnion = this.getFieldsUnion(fieldNames);
    for (const [moduleName, fieldNames] of fieldsUnion.entries()) {
      const moduleRef = this.moduleRefs.get(moduleName);
      moduleRef?.resetFields(fieldNames);
    }
    this.updateModuleFields();
  };

  /**
   * reRenderModules
   * @param {string[]} moduleNames
   */
  private reRenderModules = (moduleNames: string[]|string) => {
    if (moduleNames && !Array.isArray(moduleNames)) {
      const instance = this.moduleRefs.get(moduleNames);
      if (!instance) throw new Error(`Module ${moduleNames} doesn't exist.`);
      instance?.forceUpdate?.(this.updateModuleFields);
    } else {
      if (moduleNames?.length === 0) moduleNames = Array.from(this.moduleRefs.keys());
      (moduleNames as string[]).forEach(moduleName => {
        if (!this.moduleRefs.has(moduleName)) throw new Error(`Module ${moduleName} doesn't exist.`);
        this.moduleRefs.get(moduleName)?.forceUpdate(this.updateModuleFields);
      });
    }
  };

  /**
   * Validate fields
   * @param {string[]} ns field names
   * @param {object} opt options
   * @param {Function} cb callback function
   */
  private validateFields = this.updateBeforeAction(async (ns?: string[], opt?: { [key: string]: any }, cb?: (errors: any, values: any) => void) => {
    let errors = {};
    let values = {};
    const validateList: any[] = [];
    const { names, callback, options } = getParams(ns, opt, cb);
    const fieldsUnion = this.getFieldsUnion(names || Array.from(this.fieldModuleMap.keys()));

    for (const [moduleName, fieldNames] of fieldsUnion.entries()) {
      const moduleRef = this.moduleRefs.get(moduleName);
      if (moduleRef) validateList.push(validateFuncWrapper(moduleRef.validateFields, fieldNames, options));
    }

    for (const [errs, vals] of await Promise.all(validateList)) {
      errors = Object.assign(errors, errs);
      values = Object.assign(values, vals);
    }

    callback?.(Object.keys(errors)?.length === 0 ? null : errors, values);
  });

  /**
   * Validate fields and scroll to the first field that has an error.
   * @param {string[]} ns field names
   * @param {object} opt options
   * @param {Function} cb callback function
   */
  private validateFieldsAndScroll = async (ns?: string[], opt?: { [key: string]: any }, cb?: (errors: any, values: any) => void) => {
    const { names, callback, options } = getParams(ns, opt, cb);
    const newCb = (errors: any, values: any) => {
      if (errors) {
        const validNames = Array.from(this.fieldModuleMap.keys());
        let firstNode;
        let firstTop;
        for (const name of validNames) {
          if (errors?.[name]) {
            const module = this.moduleRefs.get(this.fieldModuleMap.get(name));
            const instance = module?.getFieldInstance(name);
            if (instance) {
              const node = ReactDOM.findDOMNode(instance);
              const top = (node as Element)?.getBoundingClientRect?.()?.top;
              if (firstTop === undefined || firstTop > top) {
                firstTop = top;
                firstNode = node;
              }
              break;
            }
          }
        }
        if (firstNode) {
          const c = options.container || getScrollableContainer(firstNode);
          scrollIntoView(firstNode as HTMLElement, c, {
            onlyScrollIfNeeded: false,
            alignWithTop: true,
            ...options,
          });
        }
      }

      if (typeof callback === 'function') {
        callback(errors, values);
      }
    };

    return this.validateFields(names, options, newCb);
  };

  /**
   * getFieldError
   * @param {string} fieldName
   */
  private getFieldError = this.updateBeforeAction((fieldName: string): string[] | undefined => {
    if (!this.isFieldRegistered(fieldName)) {
      console.warn(`FormContainer-getFieldError: ${fieldName} doesn't exist.`);
      return undefined;
    }
    const moduleName = this.fieldModuleMap.get(fieldName);
    return this.moduleRefs.get(moduleName)?.getFieldError(fieldName);
  });

  /**
   * getFieldsError
   * @param {string[]} fieldNames
   */
  private getFieldsError = this.updateBeforeAction((fieldNames?: string[]): object[] | undefined => {
    if (!fieldNames || fieldNames?.length === 0) {
      return (
        Array.from(this.moduleRefs.values()).reduce(
          (acc: any, moduleRef) => Object.assign(acc, moduleRef.getFieldsError()),
          {},
        ) || {}
      );
    }

    const fieldsUnion = this.getFieldsUnion(fieldNames || Array.from(this.fieldModuleMap.keys()));
    return (Array.from(fieldsUnion.entries()).reduce(
      (acc: any, [moduleName, fieldNames]) => {
        const instance = this.moduleRefs.get(moduleName);
        return { ...acc, ...instance?.getFieldsError(fieldNames) }
      }, {}) || {});
  })

  /**
   * clearFieldErrors
   * @param {string} fieldName
   */
  private clearFieldErrors = this.updateBeforeAction((fieldName: string): void => {
    if (!this.isFieldRegistered(fieldName)) {
      return console.warn(`FormContainer-clearFieldErrors: ${fieldName} doesn't exist.`);
    }

    const moduleName = this.fieldModuleMap.get(fieldName);
    const fields = this.moduleRefs.get(moduleName)?.fieldsStore.fields;
    if (fields?.fieldName) fields[fieldName].errors = undefined;
    this.reRenderModules(moduleName);
  });

  /**
   * isFieldTouched
   * @param {string} fieldName 
   * @returns {boolean}
   */
  private isFieldTouched = this.updateBeforeAction((fieldName: string): boolean => {
    if (!this.isFieldRegistered(fieldName)) {
      console.warn(`FormContainer-isFieldTouched: ${fieldName} doesn't exist.`);
      return false;
    }

    const moduleName = this.fieldModuleMap.get(fieldName);
    const module = this.moduleRefs.get(moduleName);
    return module ? module?.isFieldTouched(fieldName) : false;
  })

  /**
   * isFieldsTouched
   * @param {string[]} fieldNames
   * @returns {boolean}
   */
  private isFieldsTouched = this.updateBeforeAction((fieldNames?: string[]): boolean => {
    if (!fieldNames || fieldNames?.length === 0) {
      return Array.from(this.moduleRefs.values()).some((module => module.isFieldsTouched()));
    }

    const fieldsUnion = this.getFieldsUnion(fieldNames);
    return Array.from(fieldsUnion.entries()).some(([moduleName, _fieldNames]) => {
        return this.moduleRefs.get(moduleName)?.isFieldsTouched(_fieldNames);
      });
  })

  /**
   * clearFieldsErrors
   * @param {string[]} fieldNames
   */
  private clearFieldsErrors = this.updateBeforeAction((fieldNames?: string[]) => {    
    const fieldsUnion = this.getFieldsUnion(fieldNames || Array.from(this.fieldModuleMap.keys()));

    for (const [moduleName, fieldNames] of fieldsUnion.entries()) {
      const fields = this.moduleRefs.get(moduleName)?.fieldsStore.fields;
      fieldNames.forEach(fieldName => {
        if (fields?.[fieldName]) fields![fieldName].errors = undefined;
      });
      this.reRenderModules(moduleName);
    }
  })

  private getInternalHooks = () => {
    return {
      handleCallbackRef: this.handleCallbackRef,
      overwriteFormAPI: this.overwriteFormAPI,
      updateModuleFields: this.updateModuleFields
    };
  }

  public getForm = () => {
    return {
      getFieldValue: this.getFieldValue,
      getFieldsValue: this.getFieldsValue,
      setFieldsValue: this.setFieldsValue,
      resetFields: this.resetFields,
      reRenderModules: this.reRenderModules,
      validateFields: this.validateFields,
      validateFieldsAndScroll: this.validateFieldsAndScroll,
      getFieldError: this.getFieldError,
      getFieldsError: this.getFieldsError,
      clearFieldErrors: this.clearFieldErrors,
      clearFieldsErrors: this.clearFieldsErrors,
      isFieldTouched: this.isFieldTouched,
      isFieldsTouched: this.isFieldsTouched,
      getInternalHooks: this.getInternalHooks,
    }
  }
}

interface InternalFormInstance extends WrappedFormUtils {
  getInternalHooks: () => {
    handleCallbackRef: (child: ReactElement) => void;
    overwriteFormAPI: (instance: ReactElement) => void;
    updateModuleFields: () => void;
  }
}

interface UseFormPropsType {
  form?: any;
  autoUpdate?: boolean;
}

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

export { FormStore };
export default useForm;
