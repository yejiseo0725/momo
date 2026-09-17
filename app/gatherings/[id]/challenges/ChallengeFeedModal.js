'use client';

import { Button, CloseButton, Modal } from '@heroui/react';

import ChallengeFeedForm from '@/app/gatherings/[id]/challenges/ChallengeFeedForm';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ChallengeFeedModal({
  challengeId,
  defaultDate,
  gatheringId,
  imageRequired,
  maximumDate,
  minimumDate,
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  function handleSuccess() {
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button type="button" onPress={() => setIsOpen(true)}>
        실천 인증하기
      </Button>
      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>실천 인증하기</Modal.Heading>
                <CloseButton
                  aria-label="실천 인증하기 닫기"
                  className="absolute top-4 right-4"
                  onPress={() => setIsOpen(false)}
                />
              </Modal.Header>
              <Modal.Body>
                <ChallengeFeedForm
                  challengeId={challengeId}
                  defaultDate={defaultDate}
                  gatheringId={gatheringId}
                  imageRequired={imageRequired}
                  maximumDate={maximumDate}
                  minimumDate={minimumDate}
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
