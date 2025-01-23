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
  constructor(props: any) {
    const { autoUpdate = false } = props;
    this.autoUpdate = autoUpdate;
    this.moduleRefs = new Map();
    this.fieldModuleMap = new Map();
  }

  private readonly autoUpdate: boolean;
  public readonly moduleRefs: Map<string, FormInstance>;
  private fieldModuleMap: Map<string, any>;

  // CallbackRef 回调函数
  public handleCallbackRef = (child: ReactElement) => {
    const code = child?.props?.code;
    if (!code) throw new Error(`子组件 ${(child?.type as any)?.displayName || '未知组件'} 缺少code属性`);

    return (component: FormInstance) => {
      if (!component) {
        this.moduleRefs.delete(code);
        this.clearFieldModuleMap(code);
        return;
      }
      if (this.moduleRefs.has(code)) throw new Error(`模块编码 ${code} 重复`);
      this.moduleRefs.set(code, component);
      this.initializeModuleFields(code);
    };
  };

  // 覆盖 rc-form 中的方法
  public overwriteFormAPI = (instance: ReactElement) => {
    if (instance?.props?.form) {
      instance.props.form.getFieldsValue = this.getFieldsValue;
      instance.props.form.getFieldValue = this.getFieldValue;
      instance.props.form.setFieldsValue = this.setFieldsValue;
      instance.props.form.reRenderModules = this.reRenderModules;
      instance.props.form.validateFields = this.validateFields;
      instance.props.form.validateFieldsAndScroll = this.validateFieldsAndScroll;
    }
  };

  // 清空模块对应的字段映射
  private clearFieldModuleMap = (moduleDefineCode: string) => {
    for (const [k, v] of this.fieldModuleMap.entries()) {
      if (v === moduleDefineCode) {
        this.fieldModuleMap.delete(k);
      }
    }
  };

  // 初始化字段模块映射
  private initializeModuleFields = (moduleDefineCode: string) => {
    const moduleRef = this.moduleRefs.get(moduleDefineCode);
    const fieldsMeta = moduleRef?.fieldsStore?.fieldsMeta || {};

    Object.keys(fieldsMeta).forEach(fieldName => {
      if (this.fieldModuleMap.has(fieldName))
        throw new Error(
          `字段 ${fieldName} 存在冲突: 存在该字段的模块为 ${this.fieldModuleMap.get(
            fieldName,
          )} 和 ${moduleDefineCode}`,
        );
      this.fieldModuleMap.set(fieldName, moduleRef?.props?.code);
    });
  };

  /**
   * 更新字段模块映射（无字段更新则非必要）
   */
  public updateModuleFields = () => {
    const newFieldModuleMap = new Map();
    for (const [moduleDefineCode, moduleRef] of this.moduleRefs.entries()) {
      const fieldsMeta = moduleRef?.fieldsStore?.fieldsMeta || {};
      Object.keys(fieldsMeta).forEach(fieldName => {
        if (newFieldModuleMap.has(fieldName))
          throw new Error(
            `字段 ${fieldName} 存在冲突: 存在该字段的模块为 ${newFieldModuleMap.get(
              fieldName,
            )} 和 ${moduleDefineCode}`,
          );
        newFieldModuleMap.set(fieldName, moduleRef?.props?.code);
      });
    }
    this.fieldModuleMap = newFieldModuleMap;
  };

  // 获取字段关于模块的聚合
  private getFieldsUnion = (fieldNames: string[]): Map<string, string[]> => {
    const fieldsUnion = new Map();

    fieldNames.forEach(fieldName => {
      // 字段不存在跳出当前循环
      if (!this.fieldModuleMap.has(fieldName)) {
        console.error(`FormContainer-getFieldsUnion: 字段名称${fieldName}不存在`);
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

  // 操作前检查是否需要自动更新
  private checkAutoUpdateInAction = () => {
    if (!this.autoUpdate) return;
    this.updateModuleFields();
  }

  /**
   * 以下方法将覆盖 rc-form 中的对应方法
   *
   * getFieldsValue
   * getFieldValue
   * setFieldsValue
   * validateFields
   * validateFieldsAndScroll
   * resetFields
   */


  /**
   * 获取字段值
   * @param  fieldNames 需要获取的字段名称
   */
  getFieldsValue = (fieldNames?: string[]): Record<string, any> => {
    this.checkAutoUpdateInAction();
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
  };

  /**
   * 获取字段值
   * @param fieldName 字段名称
   */
  getFieldValue = (fieldName: string): any => {
    this.checkAutoUpdateInAction();
    if (!this.fieldModuleMap.has(fieldName))
      console.warn(`FormContainer-getFieldValue: 字段名称${fieldName}不存在`);
    const moduleName = this.fieldModuleMap.get(fieldName);
    return this.moduleRefs.get(moduleName)?.getFieldValue(fieldName);
  };

  /**
   * 设置字段值
   * @param fieldsValue 字段键值对
   * @param callback 回调函数
   */
  setFieldsValue = (fieldsValue: { [key: string]: any }, callback: () => void): void => {
    this.checkAutoUpdateInAction();
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
  };

  /**
   * 重置字段
   * @param fieldNames 需要重置的字段名称
   */
  resetFields = (fieldNames: string[]) => {
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
    this.checkAutoUpdateInAction();
  };

  /**
   * 重新渲染表单模块
   * @param moduleNames 需要重新渲染的模块名称
   */
  reRenderModules = (moduleNames: string[]|string) => {
    if (moduleNames && !Array.isArray(moduleNames)) {
      const instance = this.moduleRefs.get(moduleNames);
      if (!instance) throw new Error(`模块 ${moduleNames} 不存在`);
      instance?.forceUpdate?.(this.checkAutoUpdateInAction);
    } else {
      if (moduleNames?.length === 0) moduleNames = Array.from(this.moduleRefs.keys());
      (moduleNames as string[]).forEach(moduleName => {
        if (!this.moduleRefs.has(moduleName)) throw new Error(`模块 ${moduleName} 不存在`);
        this.moduleRefs.get(moduleName)?.forceUpdate(this.checkAutoUpdateInAction);
      });
    }
  };

  /**
   * 字段校验
   * @param ns 需要校验的字段名称
   * @param opt 校验配置项
   * @param cb 回调函数
   */
  validateFields = async (ns?: string[], opt?: { [key: string]: any }, cb?: (errors: any, values: any) => void) => {
    this.checkAutoUpdateInAction();
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
  };

  /**
   * 字段校验并滚动定位
   * @param ns 需要校验的字段名称
   * @param opt 校验配置项
   * @param cb 回调函数
   */
  validateFieldsAndScroll = async (ns?: string[], opt?: { [key: string]: any }, cb?: (errors: any, values: any) => void) => {
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
   * 获取字段错误信息
   * @param fieldName 字段名称
   */
  getFieldError = (fieldName: string): string[] | undefined => {
    this.checkAutoUpdateInAction();
    if (!this.fieldModuleMap.has(fieldName)) {
      console.warn(`FormContainer-getFieldError: 字段名称${fieldName}不存在`);
      return undefined;
    }
    const moduleName = this.fieldModuleMap.get(fieldName);
    return this.moduleRefs.get(moduleName)?.getFieldError(fieldName);
  };

  /**
   * 获取字段错误信息
   * @param fieldNames 字段名称
   */
  getFieldsError = (fieldNames?: string[]): object[] | undefined => {
    this.checkAutoUpdateInAction();
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
  }

  /**
   * 清空字段错误信息
   * @param fieldName 字段名称
   */
  clearFieldErrors = (fieldName: string): void => {
    this.checkAutoUpdateInAction();
    if (!this.fieldModuleMap.has(fieldName)) {
      return console.warn(`FormContainer-clearFieldErrors: 字段名称${fieldName}不存在`);
    }

    const moduleName = this.fieldModuleMap.get(fieldName);
    const fields = this.moduleRefs.get(moduleName)?.fieldsStore.fields;
    if (fields?.fieldName) fields[fieldName].errors = undefined;
    this.reRenderModules(moduleName);
  };

  /**
   * 清空字段错误信息
   * @param fieldNames 字段名称 
   */
  clearFieldsErrors = (fieldNames?: string[]) => {
    this.checkAutoUpdateInAction();
    const fieldsUnion = this.getFieldsUnion(fieldNames || Array.from(this.fieldModuleMap.keys()));

    for (const [moduleName, fieldNames] of fieldsUnion.entries()) {
      const fields = this.moduleRefs.get(moduleName)?.fieldsStore.fields;
      fieldNames.forEach(fieldName => {
        if (fields?.[fieldName]) fields![fieldName].errors = undefined;
      });
      this.reRenderModules(moduleName);
    }
  }

}

interface UseFormPropsType {
  form?: any;
  options?: {
    autoProxy?: boolean;
    autoUpdate?: boolean;
  };
}

function useForm(configs: UseFormPropsType = {}): FormStore {
  const form = configs?.form;
  const options = configs?.options || {};
  const formRef = React.useRef<any>();

  if (!formRef.current) {
    if (form) {
      formRef.current = form;
    } else {
      const formStore: FormStore = new FormStore(options);
      formRef.current = formStore;
    }
  }

  return formRef.current;
}

export { FormStore };
export default useForm;
