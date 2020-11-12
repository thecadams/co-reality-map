import React, { useCallback, useEffect, useState } from "react";

// API
import {
  createUrlSafeName,
  createVenueNew,
  Input,
  updateVenueNew,
} from "api/admin";

// Components
import SubmitButton from "components/atoms/SubmitButton/SubmitButton";
import ImageInput from "components/atoms/ImageInput";
import ToggleSwitch from "components/atoms/ToggleSwitch";

// Hooks
import { useHistory } from "react-router-dom";
import { ErrorMessage, useForm } from "react-hook-form";
import { useUser } from "hooks/useUser";

// Utils | Settings | Constants | Helpers
import { venueLandingUrl } from "utils/url";

// Typings
import { createJazzbar } from "types/Venue";
import { VenueTemplate } from "types/VenueTemplate";
import { DetailsFormProps } from "./DetailsForm.types";
import {
  setBannerURL,
  setSquareLogoUrl,
} from "pages/Admin/Venue/VenueWizard/redux/actions";

import { FormValues } from "./DetailsForm.types";

// Validation schemas
import { venueSchema } from "../ValidationSchema";

// Reducer
import { SET_FORM_VALUES } from "pages/Admin/Venue/VenueWizard/redux/actionTypes";
import { WizardState } from "pages/Admin/Venue/VenueWizard/redux";

// Stylings
import * as S from "./DetailsForm.styles";

const DetailsForm: React.FC<DetailsFormProps> = (props) => {
  const { venueId, dispatch, editData } = props;

  const [formError, setFormError] = useState(false);
  const history = useHistory();
  const { user } = useUser();

  const onSubmit = useCallback(
    async (vals: Partial<WizardState>) => {
      if (!user) return;
      try {
        // unfortunately the typing is off for react-hook-forms.
        if (!!venueId) await updateVenueNew(vals as Input, user);
        else await createVenueNew(vals as Input, user);

        vals.name
          ? history.push(`/admin/venue/${createUrlSafeName(vals.name)}`)
          : history.push(`/admin`);
      } catch (e) {
        setFormError(true);
        console.error(e);
      }
    },
    [user, venueId, history]
  );

  const {
    watch,
    formState,
    register,
    setValue,
    errors,
    handleSubmit,
  } = useForm<FormValues>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    validationSchema: venueSchema,
    validationContext: {
      editing: !!venueId,
    },
    defaultValues: venueSchema.cast(),
  });

  const values = watch();
  const { isSubmitting } = formState;

  const urlSafeName = values.name
    ? `${window.location.host}${venueLandingUrl(
        createUrlSafeName(values.name)
      )}`
    : undefined;
  const disable = isSubmitting;
  const templateID = VenueTemplate.partymap;
  const nameDisabled = isSubmitting || !!venueId;

  const defaultVenue = createJazzbar({});

  useEffect(() => {
    if (editData && venueId) {
      setValue([
        { name: editData?.name },
        { subtitle: editData?.subtitle },
        { description: editData?.description },
        { bannerImageUrl: editData?.bannerImageUrl },
        { logoImageUrl: editData?.logoImageUrl },
        { showGrid: editData?.showGrid },
      ]);

      if (values.columns === undefined) {
        setValue([{ columns: editData?.columns }]);
      }
    }
  }, [editData, setValue, values.columns, venueId]);

  const handleBannerUpload = (url: string) => setBannerURL(dispatch, url);

  const handleLogoUpload = (url: string) => setSquareLogoUrl(dispatch, url);

  const renderVenueName = () => (
    <S.InputContainer hasError={!!errors?.name}>
      <h4 className="italic" style={{ fontSize: "20px" }}>
        Name your party
      </h4>
      <input
        disabled={disable || !!venueId}
        name="name"
        ref={register}
        className="align-left"
        placeholder="My Party Name"
        style={{ cursor: nameDisabled ? "disabled" : "text" }}
      />
      {errors.name ? (
        <span className="input-error">{errors.name.message}</span>
      ) : urlSafeName ? (
        <S.InputInfo>
          The URL of your party will be: <b>{urlSafeName}</b>
        </S.InputInfo>
      ) : null}
    </S.InputContainer>
  );

  const renderSubtitle = () => (
    <S.InputContainer hasError={!!errors?.subtitle}>
      <h4 className="italic" style={{ fontSize: "20px" }}>
        Party subtitle
      </h4>
      <input
        disabled={disable}
        name={"subtitle"}
        ref={register}
        className="wide-input-block align-left"
        placeholder={defaultVenue.config?.landingPageConfig.subtitle}
      />
      {errors.subtitle && (
        <span className="input-error">{errors.subtitle.message}</span>
      )}
    </S.InputContainer>
  );

  const renderDescription = () => (
    <S.InputContainer hasError={!!errors?.description}>
      <h4 className="italic" style={{ fontSize: "20px" }}>
        Party description
      </h4>
      <textarea
        disabled={disable}
        name={"description"}
        ref={register}
        className="wide-input-block input-centered align-left"
        placeholder={defaultVenue.config?.landingPageConfig.description}
      />
      {errors.description && (
        <span className="input-error">{errors.description.message}</span>
      )}
    </S.InputContainer>
  );

  const renderBannerUpload = () => (
    <S.InputContainer>
      <h4 className="italic" style={{ fontSize: "20px" }}>
        Upload a banner photo
      </h4>
      <ImageInput
        onChange={handleBannerUpload}
        name="bannerImage"
        error={errors.bannerImageFile || errors.bannerImageUrl}
        forwardRef={register}
        imgUrl={editData?.bannerImageUrl}
      />
    </S.InputContainer>
  );

  const renderLogoUpload = () => (
    <S.InputContainer>
      <h4 className="italic" style={{ fontSize: "20px" }}>
        Upload your logo
      </h4>
      <ImageInput
        onChange={handleLogoUpload}
        name="logoImage"
        small
        error={errors.logoImageFile || errors.logoImageUrl}
        forwardRef={register}
        imgUrl={editData?.logoImageUrl}
      />
    </S.InputContainer>
  );

  const renderShowGrid = () => (
    <S.InputContainer>
      <h4>Show grid</h4>

      <ToggleSwitch
        name="showGrid"
        forwardRef={register}
        isChecked={editData?.showGrid}
      />

      {values.showGrid && (
        <div>
          <label htmlFor="grid_columns">Number of columns:</label>
          <input
            disabled={disable}
            name="columns"
            ref={register}
            id="grid_columns"
            placeholder="Number of grid columns"
            type="number"
          />
        </div>
      )}
    </S.InputContainer>
  );

  const handleOnChange = () => {
    return dispatch({
      type: SET_FORM_VALUES,
      payload: {
        name: values.name,
        subtitle: values.subtitle,
        description: values.description,
      },
    });
  };

  return (
    <S.Form onSubmit={handleSubmit(onSubmit)} onChange={handleOnChange}>
      <S.FormInnerWrapper>
        <input
          type="hidden"
          name="template"
          value={templateID}
          ref={register}
        />
        <h4 className="italic" style={{ fontSize: "30px" }}>
          {venueId ? "Edit your party" : "Create your party"}
        </h4>
        <p
          className="small light"
          style={{ marginBottom: "2rem", fontSize: "16px" }}
        >
          You can change anything except for the name of your venue later
        </p>

        {renderVenueName()}
        {renderSubtitle()}
        {renderDescription()}
        {renderBannerUpload()}
        {renderLogoUpload()}
        {renderShowGrid()}
      </S.FormInnerWrapper>

      <S.FormFooter>
        <SubmitButton
          editing={!!venueId}
          loading={isSubmitting}
          templateType="Venue"
        />
      </S.FormFooter>

      {formError && (
        <div className="input-error">
          <div>One or more errors occurred when saving the form:</div>
          {Object.keys(errors).map((fieldName) => (
            <div key={fieldName}>
              <span>Error in {fieldName}:</span>
              <ErrorMessage
                errors={errors}
                name={fieldName as string}
                as="span"
                key={fieldName}
              />
            </div>
          ))}
        </div>
      )}
    </S.Form>
  );
};

export default DetailsForm;
