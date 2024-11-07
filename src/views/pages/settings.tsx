import React, { FC, useState } from "react";
import { useIntl } from "react-intl";

import Layout from "../layout/layout";

const Settings: FC = () => {
  const intl = useIntl();

  return (
    <Layout title={intl.formatMessage({ id: "common_settingsTitle" })}>
      <h1>Settings</h1>
    </Layout>
  );
};

export default Settings;
