import React from "react";
import BaseLayout from "../../components/Layout/BaseLayout";

const NotFound = () => {
  return (
    <BaseLayout>
      <h1>404 - Página no encontrada</h1>
      <p>La URL que ingresaste no existe. ¿Quizás te perdiste? 💔</p>
    </BaseLayout>
  );
};

export default NotFound;
