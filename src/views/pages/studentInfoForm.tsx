import React, { FC, useState } from "react";
import { useIntl } from "react-intl";

import Layout from "../layout/layout";
import Text from "../text/text";

const StudentInfoForm: FC = () => {
  const intl = useIntl();

  return (
    <Layout title={intl.formatMessage({ id: "studentInfoForm_title" })}>
      <Text variant="h1" textAlign="center">
        Student Info Form
      </Text>
    </Layout>
  );
};

export default StudentInfoForm;
