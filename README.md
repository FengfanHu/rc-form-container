# Rc-form-container

Since rc-form is a higher-ordered component (HOC), rendering form component can become a long task and may even block UI rendering as the number of fields increases. Rc-form-container ia a container component for [rc-form](https://github.com/react-component/form), it divides form into chunks and manages them to improve the form performance.

由于 rc-form 通过高阶组件实现。表单中注册字段数量的增长将会导致高阶组件的渲染时间变长，甚至阻塞交互。Rc-form-container 是一个专为 [rc-form](https://github.com/react-component/form) 服务的容器组件，通过将表单拆分成小块并进行统一管控来提升表单性能。

## Install/安装

```shell
npm install rc-form-container
```

## Development/调试

```shell
npm install
npm run dev
open http://localhost:5173/
```

## Usage/使用

Use `FormContainer` to create a form context.

使用 `FormContainer` 组件创建表单容器。

```jsx
const Demo = () => {
  const form = FormContainer.useForm();

  return (
    <FormContainer form={form}>
      {/* Code your form components or any other components here. */}
    </FormContainer>
  );
};
```

Use `Module` to wrap the form component, and you need to use `code` to label each form component to distinguish them. Set your form component element for `WrappedElement`.

使用 `Module` 组件来包裹表单组件，你必须为每个表单组件定义 `code` 属性来区分他们。将表单组件的元素作为 `WrappedElement` 参数的值。

```jsx
const FormComp = ({ code, form }) => {
  return (<>
    {
      Array.from((new Array(100)), (_, index) => index)?.map((i) => {
        return (form as any)?.getFieldDecorator(`${code}_field_${i}`, {})(<input />)
      })
    }
  </>)
};

const Demo = () => {
  const form = FormContainer.useForm();

  return (
    <FormContainer form={form}>
      <Module code="module_A" WrappedElement={<FormComp {...yourProps} />} />
    </FormContainer>
  );
};
```

Use `reRenderModules(moduleNames: string[] = [])` to rerender related modules if in needed.

如果有字段联动的需要，使用 `reRenderModules(moduleNames: string[] = [])` 来重新渲染其他模块，确保关联模块能够获取到最新值。

When new fields are registered or unregistered in the form, rc-form-container will automatically maintain and update the collection of fields. Typically, you do not need to worry about this. If your form scenario does not involve dynamic registration and unregistration of fields, you can disable the automatic field updates by setting autoUpdate to false, which will improve the performance of the form to some extent.

当表单有新注册或者注销的字段 rc-form-container 会自动维护更新字段的集合。通常您并不需要关心这一点，如果您的表单场景中不存在字段的动态注册和注销，这时候你可以通过设置 `autoUpdate` 位 false 来关闭字段自动更新，这将会提升部分表单性能。

```jsx
const form = FormContainer.useForm({ autoUpdate: false });
```

## API

### FormContainer(props: FormContainerProps)

| FormContainerProps | Description                                         | Type    | Default | Required |
| ------------------ | --------------------------------------------------- | ------- | ------- | -------- |
| autoUpdate         | Auto update when fields registered or unregistered. | boolean | True    | False    |

### useForm({ options: { autoUpdate: Boolean } })

Form component default create an form instance by Form.useForm. But you can create it and pass to Form also. This allow you to call some function on the form instance. Or you cab get form instance by 'ref'.

获取容器实例，请将返回值传入容器组件或通过 `ref` 对表单进行操作。

### Module(props: ModuleProps)

| ModuleProps    | Description    | Type          | Default | Required |
| -------------- | -------------- | ------------- | ------- | -------- |
| code           | Unique label   | String        | -       | True     |
| WrappedElement | Form component | ComponentType | -       | True     |

### WrappedFormComponent

The `WrappedFormComponent` will receive two props: `code` and `form`.

`WrappedFormComponent` 会接受两个参数：`code` 和 `form`。

| Props | Description  | Type   |
| ----- | ------------ | ------ |
| code  | Unique label | String |
| form  | Form utils   | Object |

## Form utils

### getFieldValue(fieldNames: String[]): Record<string, any >

Get field value by fieldName.

获取表单数值，当 fieldNames 为空时，获取所有表单注册的所有字段的键值。

### getFieldValue(fieldNames: String[]): any

Get field value by fieldNames.

获取指定字段的值。

### setFieldsValue({ [fieldName: String]: fieldValue: any }): void

Set fields value by kv object.

设置字段值。

### validateFields(ns: String[], opt: [key: String]: value: any, cb: Function): void

Validate and get fields value by fieldNames.

校验字段。

### validateFieldsAndScroll(ns: String[], opt: [key: String]: value: any, cb: Function): void

props.form.validateFields enhancement, support scroll to the first invalid form field, scroll is the same as dom-scroll-into-view's function parameter config.

校验字段并定位。

<table class="table table-bordered table-striped">
    <thead>
    <tr>
        <th style="width: 100px;">name</th>
        <th style="width: 50px;">type</th>
        <th style="width: 50px;">default</th>
        <th>description</th>
    </tr>
    </thead>
    <tbody>
        <tr>
          <td>config.alignWithLeft</td>
          <td>Boolean</td>
          <td></td>
          <td>whether align with left edge</td>
        </tr>
        <tr>
          <td>config.alignWithTop</td>
          <td>Boolean</td>
          <td>True</td>
          <td>whether align with top edge</td>
        </tr>
        <tr>
          <td>config.offsetTop</td>
          <td>Number</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>config.offsetLeft</td>
          <td>Number</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>config.offsetBottom</td>
          <td>Number</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>config.offsetRight</td>
          <td>Number</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>config.allowHorizontalScroll</td>
          <td>Boolean</td>
          <td></td>
          <td>是否支持横向滚动</td>
        </tr>
        <tr>
          <td>config.onlyScrollIfNeeded</td>
          <td>Boolean</td>
          <td>False</td>
          <td>当 source 可见时是否滚动</td>
        </tr>
        <tr>
          <td>config.scrollable</td>
          <td>Boolean</td>
          <td>True</td>
          <td>是否开启滚动动画</td>
        </tr>
        <tr>
          <td>config.steps</td>
          <td>Number</td>
          <td>10</td>
          <td>滚动步数</td>
        </tr>
    </tbody>
</table>

### reRenderModules(moduleNames: string[] = [])

Rerender form modules by moduleNames (code).

重新渲染模块，此处 moduleNames 为表单定义的配置项 code。

### getFieldError(fieldName: string): Object[] | undefined

Get inputs' validate errors.

获取指定字段的错误信息。

### getFieldsError(fieldNames: string[]): Object[] | undefined

Get inputs' validate errors.

获取指定字段的错误信息。

### clearFieldErrors(fieldName: string): void

Clear inputs' validate error.

清除指定字段的错误信息。
