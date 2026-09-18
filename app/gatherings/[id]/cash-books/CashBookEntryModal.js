'use client';

import { Button, Modal } from '@heroui/react';

import CashBookEntryForm from '@/app/gatherings/[id]/cash-books/CashBookEntryForm';
import PlusIcon from '@/components/PlusIcon';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CashBookEntryModal({
  entryId,
  gatheringId,
  initialValues,
  mode = 'create',
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const isCreate = mode === 'create';

  function handleSuccess() {
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button type="button" onPress={() => setIsOpen(true)}>
        {isCreate ? <PlusIcon /> : null}
        {isCreate ? '내역 추가하기' : '수정'}
      </Button>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>
                  {isCreate ? '새 가계부 내역' : '가계부 내역 수정'}
                </Modal.Heading>
                <Modal.CloseTrigger
                  aria-label="가계부 모달 닫기"
                  onPress={() => setIsOpen(false)}
                  onClick={() => setIsOpen(false)}
                />
              </Modal.Header>
              <Modal.Body>
                <CashBookEntryForm
                  entryId={entryId}
                  gatheringId={gatheringId}
                  initialValues={initialValues}
                  mode={mode}
                  onSuccess={handleSuccess}
                />
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
