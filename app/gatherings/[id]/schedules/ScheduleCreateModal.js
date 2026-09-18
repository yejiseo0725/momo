'use client';

import { Button, CloseButton, Modal } from '@heroui/react';

import ScheduleForm from '@/app/gatherings/[id]/schedules/ScheduleForm';
import PlusIcon from '@/components/PlusIcon';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ScheduleCreateModal({ gatheringId }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  function handleSuccess() {
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button type="button" onPress={() => setIsOpen(true)}>
        <PlusIcon />새 일정 만들기
      </Button>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>새 일정 만들기</Modal.Heading>
                <CloseButton
                  aria-label="새 일정 만들기 닫기"
                  className="absolute top-4 right-4"
                  onPress={() => setIsOpen(false)}
                />
              </Modal.Header>
              <Modal.Body>
                <ScheduleForm
                  gatheringId={gatheringId}
                  initialValues={{
                    title: '',
                    description: '',
                    startDate: '',
                    endDate: '',
                    location: '',
                  }}
                  mode="create"
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
