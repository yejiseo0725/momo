'use client';

import { Button, Modal } from '@heroui/react';

import ChallengeForm from '@/app/gatherings/[id]/challenges/ChallengeForm';
import PlusIcon from '@/components/PlusIcon';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ChallengeCreateModal({ gatheringId }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  function handleSuccess() {
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button type="button" onPress={() => setIsOpen(true)}>
        <PlusIcon />새 챌린지 만들기
      </Button>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>새 챌린지 만들기</Modal.Heading>
                <Modal.CloseTrigger
                  aria-label="챌린지 만들기 닫기"
                  onPress={() => setIsOpen(false)}
                  onClick={() => setIsOpen(false)}
                />
              </Modal.Header>
              <Modal.Body>
                <ChallengeForm
                  gatheringId={gatheringId}
                  initialValues={{
                    title: '',
                    description: '',
                    useImage: false,
                    startDate: '',
                    endDate: '',
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
