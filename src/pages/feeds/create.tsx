import { useCallback, useRef } from 'react';
import { Form } from '@unform/web';
import Head from 'next/head';
import { FormHandles } from '@unform/core';
import * as Yup from 'yup';

import Input from '@components/Form/Input';
import Toggle from '@components/Form/Toggle';
import getValidationErrors from '@util/getValidationErrors';
import { useToast } from '@hooks/toasts';
import api from '@services/api';
import { useRouter } from 'next/router';
import Button from '@components/Form/Button';
import { authenticated } from '@hooks/auth';
import Link from 'next/link';
import schema, { FeedType } from '@services/validation/feedSchema';

const CreateFeed = ({ user }) => {
  const formRef = useRef<FormHandles>(null);
  const { addToast } = useToast();
  const router = useRouter();

  const handleSave = useCallback(
    async (data: FeedType) => {
      try {
        formRef.current.setErrors({});

        await schema.validate(data, { abortEarly: false });

        await api.post('/feeds', data);
        addToast({
          title: 'Success',
          type: 'success',
          description: `Feed ${data.name} created successfully!`,
        });
        await router.push('/feeds');
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          formRef.current.setErrors(getValidationErrors(err));
        } else {
          addToast({
            title: 'Resource creation failed.',
            type: 'error',
            description: err.response?.data.message || null,
          });
        }
      }
    },
    [addToast, router],
  );

  return (
    <div className="flex flex-col">
      <Head>
        <title>Create Feed Provider | RSS</title>
      </Head>
      <div className="text-gray-300 text-xl mb-4">
        <Link href="/feeds">RSS Providers</Link>
        {' / '}
        <span className="text-xl text-gray-300">Create Feed Provider</span>
      </div>
      <Form
        className="rounded-lg shadow bg-gray-600 py-6 px-8"
        ref={formRef}
        onSubmit={handleSave}
        initialData={{ is_active: true, is_public: false }}
      >
        <label className="block mb-2 w-full">
          <span className="block text-gray-300 mb-2">Name</span>
          <Input name="name" focused type="text" />
        </label>
        <label className="block mb-4 w-full">
          <span className="block text-gray-300 mb-2">URL</span>
          <Input name="url" type="url" />
        </label>
        <label className="flex items-center mb-4">
          <Toggle name="is_active" type="checkbox" />
          <span className="ml-2 text-gray-300">Active</span>
        </label>
        <label className="flex items-center mb-4">
          <Toggle disabled={!user.is_admin} name="is_public" type="checkbox" />
          <span className="ml-2 text-gray-300">
            Public feed provider&nbsp;
            <small className="text-xs text-gray-400 italic">*admin only*</small>
          </span>
        </label>
        <Button type="submit" className="bg-blue-600 bg-opacity-70">
          Save
        </Button>
      </Form>
    </div>
  );
};

CreateFeed.getInitialProps = async ctx => {
  const { token, user } = authenticated(ctx);

  return { token, user };
};

export default CreateFeed;
