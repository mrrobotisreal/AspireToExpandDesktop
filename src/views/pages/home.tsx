import React, { FC } from "react";
import { useIntl } from "react-intl";

import { useStudentContext } from "../../context/studentContext";
import { useThemeContext } from "../../context/themeContext";
import Layout from "../layout/layout";
import Text from "../text/text";

const Home: FC = () => {
  const intl = useIntl();
  const { info } = useStudentContext();
  const { regularFont, heavyFont } = useThemeContext();
  const { firstName } = info;

  return (
    <Layout title={intl.formatMessage({ id: "common_home" })}>
      <Text variant="h4" fontFamily={heavyFont}>
        {intl.formatMessage({ id: "common_welcome" }, { firstName })}
      </Text>
      <Text variant="body1" fontFamily={regularFont}>
        {intl.formatMessage({ id: "home_description" })}
      </Text>
    </Layout>
  );
};

export default Home;
