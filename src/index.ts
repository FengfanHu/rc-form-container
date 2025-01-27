import FormContainerComp from "./FormContainer";
import useForm from "./useForm";

type InternalFormType = typeof FormContainerComp;
interface FormType extends InternalFormType {
  useForm: typeof useForm;
}

const FormContainer = FormContainerComp as FormType;
FormContainer.useForm = useForm;
export default FormContainer;
