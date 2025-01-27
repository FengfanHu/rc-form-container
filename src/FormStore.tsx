import scrollIntoView from 'dom-scroll-into-view';
import { ReactElement, ReactInstance } from 'react';
import * as ReactDOM from 'react-dom';
import { getParams, getScrollableContainer, validateFuncWrapper } from './config';
import { WrappedFormUtils } from './interface';

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
  private handleCallbackRef = (component: FormInstance) => {
      const code = component?.props?.code;
      if (!component) {
        this.moduleRefs.delete(code);
        this.clearFieldModuleMap(code);
        return;
      }
      if (this.moduleRefs.has(code)) throw new Error(`Duplicate form code: ${code}.`);
      this.moduleRefs.set(code, component);
      this.initializeModuleFields(code);
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

export default FormStore;
