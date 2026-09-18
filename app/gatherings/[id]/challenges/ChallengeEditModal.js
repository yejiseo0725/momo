'use client';

import { Button, CloseButton, Modal } from '@heroui/react';

import ChallengeForm from '@/app/gatherings/[id]/challenges/ChallengeForm';
import { deleteChallengeAction } from '@/app/gatherings/[id]/challenges/actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ChallengeEditModal({ challenge, gatheringId }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  function handleSuccess() {
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button type="button" onPress={() => setIsOpen(true)}>
        챌린지 수정
      </Button>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>챌린지 수정</Modal.Heading>
                <CloseButton
                  aria-label="챌린지 수정 닫기"
                  className="absolute top-4 right-4"
                  onPress={() => setIsOpen(false)}
                />
              </Modal.Header>
              <Modal.Body>
                <div className="flex flex-col gap-4">
                  <ChallengeForm
                    challengeId={challenge.id}
                    gatheringId={gatheringId}
                    initialValues={challenge}
                    mode="edit"
                    onSuccess={handleSuccess}
                  />
                  <form action={deleteChallengeAction}>
                    <input
                      type="hidden"
                      name="gatheringId"
                      value={gatheringId}
                    />
                    <input
                      type="hidden"
                      name="challengeId"
                      value={challenge.id}
                    />
                    <Button type="submit" variant="danger">
                      챌린지 삭제
                    </Button>
                  </form>
                </div>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
