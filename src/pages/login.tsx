import Head from 'next/head';
import { Form } from '@unform/web';
import Input from '@components/Form/Input';
import { useCallback, useRef } from 'react';
import { FormHandles } from '@unform/core';
import { useToast } from '@hooks/toasts';
import * as Yup from 'yup';
import getValidationErrors from '@util/getValidationErrors';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@hooks/auth';
import Button from '@components/Form/Button';

interface LoginData {
  email: string;
  password: string;
}

const Login = () => {
  const formRef = useRef<FormHandles>(null);
  const { addToast } = useToast();
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = useCallback(
    async (data: LoginData) => {
      try {
        formRef.current.setErrors({});
        const schema = Yup.object().shape({
          email: Yup.string()
            .required('Email is requried.')
            .email('Invalid email format.'),
          password: Yup.string()
            .min(6, 'Minimum 6 characters.')
            .required('Password id requried.'),
        });

        await schema.validate(data, { abortEarly: false });

        const response = await signIn(data);

        addToast({
          title: 'Success',
          type: 'success',
          description: `Welcome ${response.user.name}!`,
        });

        await router.push('/');
      } catch (err) {
        formRef.current.clearField('password');
        if (err instanceof Yup.ValidationError) {
          formRef.current.setErrors(getValidationErrors(err));
        } else if (err.response?.data?.errors) {
          formRef.current.setErrors(err.response.data.errors);
        } else {
          addToast({
            title: 'Login failed.',
            type: 'error',
            description: err.response?.data.message || null,
          });
          console.error(err);
        }
      }
    },
    [addToast, router, signIn],
  );

  return (
    <div className="flex flex-col max-w-md mx-auto">
      <Head>
        <title>Login | RSS</title>
      </Head>
      <h1 className="text-xl mb-4 text-gray-300">Login</h1>
      <Form
        className="rounded-lg shadow bg-gray-600 py-6 px-8"
        ref={formRef}
        onSubmit={handleLogin}
        initialData={{ active: true }}
      >
        <label className="block mb-2 w-full">
          <span className="block text-gray-300 mb-2">Email</span>
          <Input name="email" focused type="email" />
        </label>
        <label className="block mb-4 w-full">
          <span className="block text-gray-300 mb-2">Password</span>
          <Input name="password" type="password" />
        </label>
        <p className="mb-4 text-center">
          <Link href="/recover">
            <a className="text-blue-300">Password recover</a>
          </Link>
        </p>
        <Button type="submit" className="bg-blue-400 text-blue-100">
          Login
        </Button>
      </Form>
      <p className="my-4 text-center">
        Dont have an account?{' '}
        <Link href="/register">
          <a className="text-blue-300">Sign up for free!</a>
        </Link>
      </p>
    </div>
  );
};

export default Login;
