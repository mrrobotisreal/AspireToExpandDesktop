import React, { FC } from "react";
import { useIntl } from "react-intl";

import { useStudentContext } from "../../context/studentContext";
import Layout from "../layout/layout";
import Text from "../text/text";

const Home: FC = () => {
  const intl = useIntl();
  const { info } = useStudentContext();
  const { firstName } = info;

  return (
    <Layout title={intl.formatMessage({ id: "common_home" })}>
      <Text variant="h4" fontFamily="Bauhaus-Heavy">
        {intl.formatMessage({ id: "common_welcome" }, { firstName })}
      </Text>
    </Layout>
  );
};

export default Home;
