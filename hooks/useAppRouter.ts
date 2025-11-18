import { useRouter as useNextRouter } from 'next/navigation';

const useAppRouter = () => {
  const router = useNextRouter();

  const push = (path: string, options?: any) => {
    return router.push(path, options);
  };

  const replace = (path: string, options?: any) => {
    return router.replace(path, options);
  };

  const back = () => {
    return router.back();
  };

  return {
    ...router,
    push,
    replace,
    back,
  };
};

export default useAppRouter;
