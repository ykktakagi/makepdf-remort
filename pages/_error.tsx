// pages/_error.tsx
import type { NextPageContext } from 'next';

type Props = { statusCode?: number };

function MyError({ statusCode }: Props) {
  return (
    <p>
      {statusCode
        ? `${statusCode} - サーバーエラーが発生しました。`
        : '予期しないエラーが発生しました。'}
    </p>
  );
}

MyError.getInitialProps = ({ res, err }: NextPageContext) => {
  return { statusCode: res?.statusCode ?? err?.statusCode };
};

export default MyError;
